import json
import sqlite3
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.models import LoginInfo, SeedMetadata, UserAddins, UserMetadata, UserStats


def _parse_json(value: Any, default: Any) -> Any:
    """Legacy SQLite stores JSON as text; parse it into real JSON for JSONB."""
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


def _already_seeded(db: Session) -> bool:
    marker = db.execute(select(SeedMetadata).limit(1)).scalar_one_or_none()
    return marker is not None and marker.seeded


def _mark_seeded(db: Session) -> None:
    db.add(SeedMetadata(seeded=True))
    db.commit()


def _import_from_sqlite(db: Session, sqlite_path: Path) -> None:
    conn = sqlite3.connect(str(sqlite_path))
    conn.row_factory = sqlite3.Row
    try:
        for row in conn.execute("SELECT * FROM user_stats"):
            db.add(
                UserStats(
                    user_email=row["user_email"],
                    user_name=row["user_name"],
                    published_addins=_parse_json(row["published_addins"], []),
                    installed_addins=_parse_json(row["installed_addins"], []),
                    disciplines=_parse_json(row["disciplines"], []),
                    date_added=row["date_added"] if "date_added" in row.keys() else None,
                )
            )

        for row in conn.execute("SELECT * FROM user_addins"):
            db.add(
                UserAddins(
                    user_email=row["user_email"],
                    allowed_addin_ids=_parse_json(row["allowed_addin_ids"], []),
                    allowed_addin_paths=_parse_json(row["allowed_addin_paths"], []),
                    # Not present in the legacy SQLite DB; start empty.
                    blocked_addin_paths=[],
                    discipline=row["discipline"],
                )
            )

        for row in conn.execute("SELECT * FROM user_metadata"):
            db.add(
                UserMetadata(
                    user_email=row["user_email"],
                    metadata_=_parse_json(row["metadata"], {}),
                )
            )

        for row in conn.execute("SELECT * FROM login_info"):
            db.add(
                LoginInfo(
                    user_email=row["user_email"],
                    password_hash=row["password_hash"],
                    salt=row["salt"],
                )
            )
    finally:
        conn.close()

    db.commit()


def run_seed() -> None:
    """Create tables and, on first start only, import the bundled SQLite data."""
    Base.metadata.create_all(bind=engine)

    settings = get_settings()
    sqlite_path = Path(settings.sqlite_seed_path)

    db = SessionLocal()
    try:
        if _already_seeded(db):
            print("[seed] Postgres already seeded; skipping SQLite import.")
            return

        if not sqlite_path.exists():
            print(f"[seed] No SQLite seed file at {sqlite_path}; marking seeded with empty DB.")
            _mark_seeded(db)
            return

        print(f"[seed] First start: importing data from {sqlite_path} ...")
        _import_from_sqlite(db, sqlite_path)
        _mark_seeded(db)
        print("[seed] SQLite import complete.")
    finally:
        db.close()
