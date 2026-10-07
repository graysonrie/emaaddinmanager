# EMA Addin Manager Stats Server

An Axum + SeaORM service that owns the user-stats data the Tauri desktop app used to keep in a local `UserStats2.db` SQLite file. The Tauri client talks to this server over HTTP instead of opening the SQLite file directly.

On its **first** start the server creates its tables and imports all rows from the bundled SQLite database in [`assets/UserStats2.db`](assets/UserStats2.db). After that it runs purely on Postgres. A `seed_metadata` marker row records that the import has happened, so restarts never re-import.

## Requirements

- Docker + Docker Compose

## Configuration

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

| Variable            | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `POSTGRES_USER`     | Postgres username (used by both the `db` and `api` services).           |
| `POSTGRES_PASSWORD` | Postgres password.                                                      |
| `POSTGRES_DB`       | Postgres database name.                                                 |
| `API_KEY`           | Shared secret clients must send in the `X-API-Key` header.              |
| `API_PORT`          | Host port the API is published on (the container listens on 8000).      |
| `DATABASE_URL`      | Postgres URL. `postgres://` and `postgresql://` are both accepted.      |
| `SQLITE_SEED_PATH`  | Optional override for the bundled seed file.                            |
| `PORT`              | Port the process binds. Defaults to 8000. Render sets this automatically. |

The `API_KEY` here must match the `STATS_SERVER_API_KEY` environment variable used by the Tauri client.

## Running

```bash
docker compose up --build
```

This starts:

- `db`: Postgres 16 with a persistent named volume (`pgdata`).
- `api`: the server on `http://localhost:8000`.

The API waits for Postgres to become healthy, then runs the one-time seed.

Verify it is up:

```bash
curl http://localhost:8000/health
curl -H "X-API-Key: change-me" http://localhost:8000/ping
```

## Authentication

`/health` is public. Every other endpoint requires the shared API key:

```bash
curl -H "X-API-Key: <your key>" http://localhost:8000/user-stats
```

Requests with a missing or wrong key get `401 Unauthorized`.

## First-time seeding

Seeding is **idempotent**. A `seed_metadata` marker row records that the import has happened, so restarts never re-import, and later deletions of users will not trigger a re-seed. To force a fresh re-seed, drop the Postgres volume:

```bash
docker compose down -v
docker compose up --build
```

The Docker image includes [`assets/UserStats2.db`](assets/UserStats2.db). On the **first** successful start against a **new** Postgres instance, the app imports SQLite into Postgres once. If the seed file or the `assets` directory is missing, the server refuses to start.

Check the logs for `[seed] First start: importing data from …` on the first boot, or `[seed] Postgres already seeded; skipping SQLite import.` on later ones.

## Render

[`render.yaml`](render.yaml) is a Render blueprint. It must live at the root of the repository Render is connected to. It provisions:

- `ema-stats-db`: Postgres (`basic-256mb`, Oregon, database and user `stats`, no public IP access)
- `ema-stats-api`: Docker web service (`starter`, Oregon, branch `release`, health check `/health`)

`DATABASE_URL` is wired from the managed database. Set `API_KEY` in the Render dashboard (`sync: false` in the blueprint). It must match the Tauri client's `STATS_SERVER_API_KEY`.

Each push to `release` builds and deploys. Verify:

```bash
curl https://<your-render-domain>/health
curl -H "X-API-Key: <your key>" https://<your-render-domain>/ping
```

To **re-seed** production data, reset the Postgres instance, then redeploy so the first boot runs again.

## Endpoints

`/health` is unauthenticated. All other routes require the `X-API-Key` header.

JSON keys are camelCase.

### health

| Method | Path     | Description                                      |
| ------ | -------- | ------------------------------------------------ |
| GET    | `/health`| Liveness check. No API key.                      |
| GET    | `/ping`  | Authenticated liveness check.                    |

### user-stats

| Method | Path                         | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| POST   | `/user-stats`                | Create a user (`409` if it already exists).  |
| GET    | `/user-stats`                | List all user stats.                         |
| GET    | `/user-stats/summary`        | Lightweight list with counts and app version.|
| GET    | `/user-stats/{email}`        | Get one user (`404` if not found).           |
| PATCH  | `/user-stats/{email}`        | Change `userName`.                           |
| PUT    | `/user-stats/{email}/fields` | Upsert published/installed addins + disciplines. |

`PATCH` and `PUT` return `204` even when the user does not exist.

### user-addins

| Method | Path                                 | Description                              |
| ------ | ------------------------------------ | ---------------------------------------- |
| POST   | `/user-addins`                       | Create a user-addins row.                |
| GET    | `/user-addins/{email}`               | Get one (`404` if not found).            |
| PUT    | `/user-addins/{email}/allowed-paths` | Replace the allowed addin paths.         |
| PUT    | `/user-addins/{email}/blocked-paths` | Replace the blocked addin paths.         |
| POST   | `/user-addins/block-path-for-all`    | Block one path for every user, with optional `excludeEmails`. |
| POST   | `/user-addins/unblock-path-for-all`  | Remove one path from every user.         |

Allowed and blocked path lists are sorted and de-duplicated.

### user-metadata

| Method | Path                                   | Description                            |
| ------ | -------------------------------------- | -------------------------------------- |
| POST   | `/user-metadata/{email}/get-or-create` | Fetch metadata, creating it if absent. |
| PUT    | `/user-metadata/{email}`               | Upsert the metadata body.              |
| POST   | `/user-metadata/query`                 | Fetch metadata for many emails.        |

### login-info

| Method | Path                  | Description                                          |
| ------ | --------------------- | ---------------------------------------------------- |
| PUT    | `/login-info/{email}` | Store the password hash + salt (hashing is client side). |
| GET    | `/login-info/{email}` | Return hash + salt (`404` if not found).             |

### users (cross-table)

| Method | Path                  | Description                                       |
| ------ | --------------------- | ------------------------------------------------- |
| POST   | `/users/change-email` | Change a user's email across every table.         |
| DELETE | `/users/{email}`      | Remove a user from every table (unregister).      |

Both cross-table operations run in one transaction and return `204` when the user is already absent.

## Local development (without Docker)

Requires a running Postgres 16 database. JSON columns are stored as `JSONB`.

```bash
cargo run
```

Set `DATABASE_URL` and `API_KEY` first, for example from `.env.example`. The process loads a `.env` file in the working directory when one is present.
