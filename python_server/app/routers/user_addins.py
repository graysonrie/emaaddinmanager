from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import UserAddins
from app.schemas import (
    CreateUserAddinsRequest,
    SetAllowedPathsRequest,
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
