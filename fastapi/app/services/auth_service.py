import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_token, hash_password, verify_password
from app.core.settings import settings
from app.models.login_info import LoginInfo
from app.models.user import User, UserRole
from app.models.user_addins import UserAddins
from app.models.user_metadata import UserMetadata


def register_user(
    db: Session, *, email: str, name: str, discipline: str, password: str
) -> tuple[User, str, str]:
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise ValueError("User already exists")

    user = User(email=email, name=name, discipline=discipline, role=UserRole.USER)
    db.add(user)
    db.flush()

    db.add(
        LoginInfo(
            user_id=user.id,
            password_hash=hash_password(password),
            is_temporary_password=False,
        )
    )
    db.add(
        UserAddins(
            user_id=user.id,
            allowed_addin_ids=[],
            allowed_addin_paths=[],
            discipline=discipline,
        )
    )
    db.add(UserMetadata(user_id=user.id, metadata={"appVersion": None}))
    db.commit()

    return user, _build_access(user.email), _build_refresh(user.email)


def login_user(db: Session, *, email: str, password: str) -> tuple[User, str, str]:
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise ValueError("Invalid credentials")

    login_info = db.scalar(select(LoginInfo).where(LoginInfo.user_id == user.id))
    if not login_info or not verify_password(password, login_info.password_hash):
        raise ValueError("Invalid credentials")

    return user, _build_access(user.email), _build_refresh(user.email)


def set_password(db: Session, *, email: str, password: str, temporary: bool = False) -> None:
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise ValueError("User not found")

    login_info = db.scalar(select(LoginInfo).where(LoginInfo.user_id == user.id))
    if login_info is None:
        login_info = LoginInfo(user_id=user.id, password_hash="", is_temporary_password=temporary)
        db.add(login_info)

    login_info.password_hash = hash_password(password)
    login_info.is_temporary_password = temporary
    db.commit()


def set_temporary_password(db: Session, *, email: str) -> str:
    temp_password = secrets.token_urlsafe(10)
    set_password(db, email=email, password=temp_password, temporary=True)
    return temp_password


def _build_access(email: str) -> str:
    return create_token(email, settings.access_token_minutes, "access")


def _build_refresh(email: str) -> str:
    return create_token(email, settings.refresh_token_minutes, "refresh")
