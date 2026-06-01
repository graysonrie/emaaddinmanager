# EMA Addin Manager Stats Server

A standalone FastAPI + Postgres service that owns the user-stats data the Tauri
desktop app used to keep in a local `UserStats2.db` SQLite file. The Tauri client
now talks to this server over HTTP instead of opening the SQLite file directly.

On its **first** start the server creates its tables and imports all rows from the
bundled SQLite database in [`assets/UserStats2.db`](assets/UserStats2.db). After
that it runs purely on Postgres.

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
| `API_PORT`          | Host port the API is published on (the container always listens on 8000). |

The `API_KEY` here must match the `STATS_SERVER_API_KEY` environment variable used
by the Tauri client.

## Running

```bash
docker compose up --build
```

This starts:

- `db` - Postgres 16 with a persistent named volume (`pgdata`).
- `api` - the FastAPI app on `http://localhost:8000`.

The API waits for Postgres to become healthy, then runs the one-time seed.

Verify it is up:

```bash
curl http://localhost:8000/health
```

Interactive API docs are available at `http://localhost:8000/docs`.

## Authentication

Every endpoint (except `/health`) requires the shared API key:

```bash
curl -H "X-API-Key: <your key>" http://localhost:8000/user-stats
```

Requests with a missing or wrong key get `401 Unauthorized`.

## First-time seeding

Seeding is **idempotent**. A `seed_metadata` marker row records that the import
has happened, so restarts never re-import, and later deletions of users will not
trigger a re-seed. To force a fresh re-seed, drop the Postgres volume:

```bash
docker compose down -v
docker compose up --build
```

## Deploying to Render

This repo includes a [`render.yaml`](render.yaml) Blueprint that provisions a
managed PostgreSQL database and a Docker web service which auto-deploys on every
push to the `release` branch.

> Render reads `render.yaml` from the **root** of the connected repository. This
> assumes the server lives in its own repo with `render.yaml`, `Dockerfile`,
> `app/`, and `assets/` at the root.

Setup (one time):

1. Push this code to its own GitHub repo and create a `release` branch.
2. In the Render dashboard: **New > Blueprint**, pick the repo. Render reads
   `render.yaml` and shows the database + web service it will create.
3. When prompted, set the `API_KEY` value (it is marked `sync: false`, so it is
   never stored in the repo). Use the same value for the Tauri client's
   `STATS_SERVER_API_KEY`.
4. Click **Apply**. Render builds the image, creates the database, injects
   `DATABASE_URL`, and runs the container. On first boot the lifespan seeds the
   database from the bundled SQLite file (idempotent on later deploys).

After that, every push to `release` triggers an automatic rebuild + deploy.

Point the Tauri client at the deployed URL:

- `STATS_SERVER_URL=https://<your-service>.onrender.com`
- `STATS_SERVER_API_KEY=<the key you set in Render>`

Notes:

- The Blueprint uses `free` plans to start. The free database expires ~30 days
  after creation and free web services sleep when idle (cold starts just log
  "already seeded"). Upgrade the `plan` values in `render.yaml` for production.
- `DATABASE_URL` from Render arrives as `postgresql://...`; the config layer
  rewrites it to the `postgresql+psycopg://` driver automatically.
- The container binds to Render's injected `$PORT` (defaults to `8000` locally).
- Schema changes after launch: `create_all` only creates missing tables, it does
  not `ALTER` existing ones. Once the managed database holds real data, add new
  columns/tables via a migration tool (e.g. Alembic) rather than relying on
  startup table creation.

## Endpoints

All routes require the `X-API-Key` header.

### user-stats

| Method | Path                        | Description                                  |
| ------ | --------------------------- | -------------------------------------------- |
| POST   | `/user-stats`               | Create a user (`409` if it already exists).  |
| GET    | `/user-stats`               | List all user stats.                         |
| GET    | `/user-stats/{email}`       | Get one user (`404` if not found).           |
| PATCH  | `/user-stats/{email}`       | Change `userName`.                           |
| PUT    | `/user-stats/{email}/fields`| Upsert published/installed addins + disciplines. |

### user-addins

| Method | Path                                | Description                              |
| ------ | ----------------------------------- | ---------------------------------------- |
| POST   | `/user-addins`                      | Create a user-addins row.                |
| GET    | `/user-addins/{email}`              | Get one (`404` if not found).            |
| PUT    | `/user-addins/{email}/allowed-paths`| Replace the allowed addin paths.         |

### user-metadata

| Method | Path                                  | Description                            |
| ------ | ------------------------------------- | -------------------------------------- |
| POST   | `/user-metadata/{email}/get-or-create`| Fetch metadata, creating it if absent. |
| PUT    | `/user-metadata/{email}`              | Upsert the metadata body.              |
| POST   | `/user-metadata/query`                | Fetch metadata for many emails.        |

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

## Local development (without Docker)

```bash
python -m venv env
env\Scripts\activate          # Windows
pip install -r requirements.txt
set DATABASE_URL=postgresql+psycopg://stats:stats@localhost:5432/stats
set API_KEY=change-me
uvicorn app.main:app --reload
```

(JSON columns are stored as Postgres `JSONB`, so a real Postgres instance is
required; the SQLite file is only used for the initial seed.)
