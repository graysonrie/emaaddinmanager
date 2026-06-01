from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routers import login_info, user_addins, user_metadata, user_stats, users
from app.seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and perform the one-time SQLite import on first start.
    run_seed()
    yield


app = FastAPI(title="EMA Addin Manager Stats Server", lifespan=lifespan)

app.include_router(user_stats.router)
app.include_router(user_addins.router)
app.include_router(user_metadata.router)
app.include_router(login_info.router)
app.include_router(users.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
