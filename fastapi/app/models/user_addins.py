import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class UserAddins(Base):
    __tablename__ = "user_addins"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    allowed_addin_ids: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    allowed_addin_paths: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)
    discipline: Mapped[str] = mapped_column(String(255), default="", nullable=False)
