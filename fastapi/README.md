# EMA Addin Manager FastAPI

## Run locally

1. Copy `.env.example` to `.env`.
2. Start Postgres:
   - `docker compose up -d`
3. Install dependencies (example with uv):
   - `uv sync`
4. Run migrations:
   - `uv run alembic upgrade head`
5. Start API:
   - `uv run uvicorn app.main:app --reload --port 8000`

## Test

- `uv run pytest`
