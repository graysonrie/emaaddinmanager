import argparse
import json
import sqlite3
from dataclasses import dataclass, field

import psycopg


@dataclass
class MigrationReport:
    users_seen: int = 0
    users_inserted: int = 0
    users_skipped: int = 0
    missing_login_rows: int = 0
    errors: list[str] = field(default_factory=list)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Migrate legacy SQLite data to Postgres.")
    parser.add_argument("--sqlite-path", required=True, help="Path to legacy UserStats2.db")
    parser.add_argument(
        "--postgres-dsn",
        required=True,
        help="Postgres DSN, for example: postgresql://postgres:postgres@localhost:5432/emaaddinmanager",
    )
    parser.add_argument("--dry-run", action="store_true", help="Do not write to Postgres")
    return parser.parse_args()


def migrate(sqlite_path: str, postgres_dsn: str, dry_run: bool) -> MigrationReport:
    report = MigrationReport()
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row

    pg_conn = psycopg.connect(postgres_dsn)
    pg_conn.autocommit = False

    try:
        users = sqlite_conn.execute("SELECT * FROM user_stats").fetchall()
        for user in users:
            email = user["user_email"]
            report.users_seen += 1
            try:
                if dry_run:
                    report.users_inserted += 1
                    continue

                with pg_conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO users (id, email, name, discipline, role)
                        VALUES (gen_random_uuid(), %s, %s, %s, %s)
                        ON CONFLICT (email) DO NOTHING
                        """,
                        (
                            email,
                            user["user_name"] or "",
                            _first_discipline(user["disciplines"]),
                            "user",
                        ),
                    )
                    if cur.rowcount == 0:
                        report.users_skipped += 1
                        continue

                    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                    user_id = cur.fetchone()[0]
                    cur.execute(
                        """
                        INSERT INTO user_addins (user_id, allowed_addin_ids, allowed_addin_paths, discipline)
                        VALUES (%s, %s::jsonb, %s::jsonb, %s)
                        ON CONFLICT (user_id) DO NOTHING
                        """,
                        (user_id, "[]", "[]", _first_discipline(user["disciplines"])),
                    )
                    cur.execute(
                        """
                        INSERT INTO user_metadata (user_id, metadata)
                        VALUES (%s, %s::jsonb)
                        ON CONFLICT (user_id) DO NOTHING
                        """,
                        (user_id, json.dumps({"appVersion": None})),
                    )
                report.users_inserted += 1
            except Exception as err:  # noqa: BLE001
                report.errors.append(f"user {email}: {err}")

        if not dry_run:
            pg_conn.commit()
    finally:
        sqlite_conn.close()
        pg_conn.close()
    return report


def _first_discipline(raw_json: str | None) -> str:
    if not raw_json:
        return ""
    try:
        parsed = json.loads(raw_json)
        if isinstance(parsed, list) and parsed:
            return str(parsed[0])
    except json.JSONDecodeError:
        return ""
    return ""


if __name__ == "__main__":
    args = parse_args()
    result = migrate(args.sqlite_path, args.postgres_dsn, args.dry_run)
    print(
        json.dumps(
            {
                "users_seen": result.users_seen,
                "users_inserted": result.users_inserted,
                "users_skipped": result.users_skipped,
                "missing_login_rows": result.missing_login_rows,
                "errors": result.errors,
            },
            indent=2,
        )
    )
