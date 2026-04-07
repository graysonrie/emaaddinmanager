from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.registry import Addin, Category


def get_categories(db: Session) -> list[Category]:
    rows = db.scalars(select(Category).order_by(Category.full_path)).all()
    return list(rows)


def get_addins(db: Session) -> list[Addin]:
    rows = db.scalars(select(Addin).where(Addin.is_listed.is_(True)).order_by(Addin.name)).all()
    return list(rows)
