from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import UserStats
from app.schemas import (
    ChangeNameRequest,
    CreateUserStatsRequest,
    UpsertFieldsRequest,
    UserStatsModel,
)

router = APIRouter(
    prefix="/user-stats",
    tags=["user-stats"],
    dependencies=[Depends(require_api_key)],
)


@router.post("", response_model=UserStatsModel, status_code=status.HTTP_201_CREATED)
def create_user(body: CreateUserStatsRequest, db: Session = Depends(get_db)) -> UserStats:
    if not body.user_email or not body.user_name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "user_email and user_name are required")

    existing = db.get(UserStats, body.user_email)
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "User already exists")

    user = UserStats(
        user_email=body.user_email,
        user_name=body.user_name,
        published_addins=[],
        installed_addins=[],
        disciplines=[],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserStatsModel])
def get_all_user_stats(db: Session = Depends(get_db)) -> list[UserStats]:
    return list(db.execute(select(UserStats)).scalars().all())


@router.get("/{user_email}", response_model=UserStatsModel)
def get_user(user_email: str, db: Session = Depends(get_db)) -> UserStats:
    user = db.get(UserStats, user_email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.patch("/{user_email}", status_code=status.HTTP_204_NO_CONTENT)
def change_name(user_email: str, body: ChangeNameRequest, db: Session = Depends(get_db)) -> None:
    user = db.get(UserStats, user_email)
    if user is not None:
        user.user_name = body.user_name
        db.commit()


@router.put("/{user_email}/fields", status_code=status.HTTP_204_NO_CONTENT)
def upsert_fields(user_email: str, body: UpsertFieldsRequest, db: Session = Depends(get_db)) -> None:
    user = db.get(UserStats, user_email)
    if user is not None:
        user.published_addins = body.published_addins
        user.installed_addins = body.installed_addins
        user.disciplines = body.disciplines
        db.commit()
