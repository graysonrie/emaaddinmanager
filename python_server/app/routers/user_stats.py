from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import UserMetadata, UserStats
from app.schemas import (
    ChangeNameRequest,
    CreateUserStatsRequest,
    UpsertFieldsRequest,
    UserStatsModel,
    UserStatsSummaryModel,
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


def _distinct_installed_count(installed_addins) -> int:
    """Count installed addins distinct by name, mirroring the client's
    `deduplicateInstalledAddins` grouping."""
    if not isinstance(installed_addins, list):
        return 0
    names = set()
    for entry in installed_addins:
        if isinstance(entry, dict):
            addin = entry.get("addin")
            if isinstance(addin, dict):
                names.add(addin.get("name"))
    return len(names)


# NOTE: This route MUST be declared before `/{user_email}` so that the literal
# "summary" segment is not captured as a `user_email` path parameter.
@router.get("/summary", response_model=list[UserStatsSummaryModel])
def get_user_stats_summary(db: Session = Depends(get_db)) -> list[UserStatsSummaryModel]:
    """Lightweight list of every user: name, email, disciplines, addin counts
    and app version. Avoids shipping the heavy addin arrays to the client."""
    rows = db.execute(
        select(UserStats, UserMetadata.metadata_).join(
            UserMetadata,
            UserMetadata.user_email == UserStats.user_email,
            isouter=True,
        )
    ).all()

    summaries: list[UserStatsSummaryModel] = []
    for user, metadata in rows:
        published = user.published_addins if isinstance(user.published_addins, list) else []
        app_version = metadata.get("appVersion") if isinstance(metadata, dict) else None
        summaries.append(
            UserStatsSummaryModel(
                user_email=user.user_email,
                user_name=user.user_name,
                disciplines=user.disciplines,
                published_addins_count=len(published),
                installed_addins_count=_distinct_installed_count(user.installed_addins),
                app_version=app_version,
            )
        )
    return summaries


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
