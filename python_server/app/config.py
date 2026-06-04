from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Repository root for this server (python_server/)
SERVER_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_SEED_PATH = SERVER_ROOT / "assets" / "UserStats2.db"


def _normalize_database_url(url: str) -> str:
    """Ensure the URL uses the psycopg (v3) SQLAlchemy driver.

    Managed providers such as Render hand out connection strings of the form
    `postgres://...` or `postgresql://...`, which SQLAlchemy would route to the
    (uninstalled) psycopg2 driver. Rewrite the scheme to `postgresql+psycopg://`
    so it uses psycopg 3, while leaving URLs that already specify a driver
    (or non-postgres URLs) untouched.
    """
    if url.startswith("postgresql+"):
        return url
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    return url


class Settings(BaseSettings):
    """Server configuration, populated from environment variables.

    Values can be provided via a `.env` file or the process environment.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # postgresql+psycopg://user:password@host:5432/dbname
    database_url: str = "postgresql+psycopg://stats:stats@db:5432/stats"

    # Shared secret that clients must send in the `X-API-Key` header.
    api_key: str = "change-me"

    # Location of the bundled SQLite database used to seed Postgres the first
    # time the server starts.
    sqlite_seed_path: str = str(DEFAULT_SQLITE_SEED_PATH)

    @property
    def sqlalchemy_url(self) -> str:
        """The database URL with a guaranteed SQLAlchemy driver."""
        return _normalize_database_url(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
