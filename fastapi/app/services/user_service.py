from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_addins import UserAddins


def get_user(db: Session, email: str) -> tuple[User, UserAddins | None] | None:
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        return None
    addins = db.scalar(select(UserAddins).where(UserAddins.user_id == user.id))
    return user, addins


def set_allowed_addin_paths(db: Session, email: str, addin_paths: list[str]) -> None:
    found = get_user(db, email)
    if not found:
        raise ValueError("User not found")
    user, addins = found
    if addins is None:
        addins = UserAddins(
            user_id=user.id,
            allowed_addin_ids=[],
            allowed_addin_paths=addin_paths,
            discipline=user.discipline,
        )
        db.add(addins)
    else:
        addins.allowed_addin_paths = addin_paths
    db.commit()
