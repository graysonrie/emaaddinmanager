from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import UserAddins
from app.schemas import (
    BlockPathForAllRequest,
    CreateUserAddinsRequest,
    SetAllowedPathsRequest,
    SetBlockedPathsRequest,
    UnblockPathForAllRequest,
    UserAddinsModel,
)

router = APIRouter(
    prefix="/user-addins",
    tags=["user-addins"],
    dependencies=[Depends(require_api_key)],
)


@router.post("", response_model=UserAddinsModel, status_code=status.HTTP_201_CREATED)
def create_user(body: CreateUserAddinsRequest, db: Session = Depends(get_db)) -> UserAddins:
    existing = db.get(UserAddins, body.user_email)
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "User already exists")

    user = UserAddins(
        user_email=body.user_email,
        allowed_addin_ids=[],
        allowed_addin_paths=[],
        blocked_addin_paths=[],
        discipline=body.discipline,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_email}", response_model=UserAddinsModel)
def get_user(user_email: str, db: Session = Depends(get_db)) -> UserAddins:
    user = db.get(UserAddins, user_email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.put("/{user_email}/allowed-paths", status_code=status.HTTP_204_NO_CONTENT)
def set_allowed_paths(
    user_email: str, body: SetAllowedPathsRequest, db: Session = Depends(get_db)
) -> None:
    user = db.get(UserAddins, user_email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    # Sort + dedupe to match the previous Rust behaviour.
    cleaned = sorted(set(body.paths))
    user.allowed_addin_paths = cleaned
    db.commit()


@router.put("/{user_email}/blocked-paths", status_code=status.HTTP_204_NO_CONTENT)
def set_blocked_paths(
    user_email: str, body: SetBlockedPathsRequest, db: Session = Depends(get_db)
) -> None:
    user = db.get(UserAddins, user_email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    cleaned = sorted(set(body.paths))
    user.blocked_addin_paths = cleaned
    db.commit()


@router.post("/block-path-for-all", status_code=status.HTTP_204_NO_CONTENT)
def block_path_for_all(
    body: BlockPathForAllRequest, db: Session = Depends(get_db)
) -> None:
    """Add the given addin path to blocked_addin_paths for every user except
    those listed in exclude_emails (e.g. admins)."""
    excluded = set(body.exclude_emails)
    users = db.query(UserAddins).all()
    for user in users:
        if user.user_email in excluded:
            continue
        existing = list(user.blocked_addin_paths or [])
        if body.path in existing:
            continue
        # Reassign a new list so SQLAlchemy detects the JSONB change.
        user.blocked_addin_paths = sorted({*existing, body.path})
    db.commit()


@router.post("/unblock-path-for-all", status_code=status.HTTP_204_NO_CONTENT)
def unblock_path_for_all(
    body: UnblockPathForAllRequest, db: Session = Depends(get_db)
) -> None:
    """Remove the given addin path from blocked_addin_paths for every user."""
    users = db.query(UserAddins).all()
    for user in users:
        existing = list(user.blocked_addin_paths or [])
        if body.path not in existing:
            continue
        # Reassign a new list so SQLAlchemy detects the JSONB change.
        user.blocked_addin_paths = [p for p in existing if p != body.path]
    db.commit()
