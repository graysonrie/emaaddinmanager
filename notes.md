Start backend stack:
cd fastapi
docker compose up -d
alembic upgrade head
uvicorn app.main:app --reload --port 8000