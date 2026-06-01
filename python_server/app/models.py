from sqlalchemy import Boolean, DateTime, String, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserStats(Base):
    __tablename__ = "user_stats"

    user_email: Mapped[str] = mapped_column(String, primary_key=True)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    # Type: list[PublishedAddinModel]
    published_addins: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    # Type: list[InstalledAddinModel]
    installed_addins: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    # Type: list[str]
    disciplines: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    # Extra column present in the legacy SQLite database; preserved on migration.
    date_added: Mapped[str | None] = mapped_column(String, nullable=True)


class UserAddins(Base):
    __tablename__ = "user_addins"

    user_email: Mapped[str] = mapped_column(String, primary_key=True)
    allowed_addin_ids: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    allowed_addin_paths: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    # NOT present in the original UserStats2.db. Defaults to an empty list so it
    # is populated for migrated rows and any insert that omits it.
    blocked_addin_paths: Mapped[list | dict] = mapped_column(
        JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb")
    )
    discipline: Mapped[str] = mapped_column(String, nullable=False)


class UserMetadata(Base):
    __tablename__ = "user_metadata"

    user_email: Mapped[str] = mapped_column(String, primary_key=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False)


class LoginInfo(Base):
    __tablename__ = "login_info"

    user_email: Mapped[str] = mapped_column(String, primary_key=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    salt: Mapped[str] = mapped_column(String, nullable=False)


class SeedMetadata(Base):
    """Single-row marker table that records whether the one-time SQLite import ran."""

    __tablename__ = "seed_metadata"

    id: Mapped[int] = mapped_column(primary_key=True)
    seeded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    seeded_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
