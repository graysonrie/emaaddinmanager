from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import UserMetadata
from app.schemas import (
    MetadataQueryRequest,
    SetMetadataRequest,
    UserMetadataModel,
)

router = APIRouter(
    prefix="/user-metadata",
    tags=["user-metadata"],
    dependencies=[Depends(require_api_key)],
)


def _to_model(entity: UserMetadata) -> UserMetadataModel:
    return UserMetadataModel(user_email=entity.user_email, metadata=entity.metadata_)


@router.post("/{user_email}/get-or-create", response_model=UserMetadataModel)
def get_or_create(user_email: str, db: Session = Depends(get_db)) -> UserMetadataModel:
    user = db.get(UserMetadata, user_email)
    if user is None:
        user = UserMetadata(user_email=user_email, metadata_={"appVersion": None})
        db.add(user)
        db.commit()
        db.refresh(user)
    return _to_model(user)


@router.put("/{user_email}", status_code=status.HTTP_204_NO_CONTENT)
def set_metadata(user_email: str, body: SetMetadataRequest, db: Session = Depends(get_db)) -> None:
    user = db.get(UserMetadata, user_email)
    if user is None:
        db.add(UserMetadata(user_email=user_email, metadata_=body.metadata))
    else:
        user.metadata_ = body.metadata
    db.commit()


@router.post("/query", response_model=list[UserMetadataModel])
def get_many(body: MetadataQueryRequest, db: Session = Depends(get_db)) -> list[UserMetadataModel]:
    rows = (
        db.execute(select(UserMetadata).where(UserMetadata.user_email.in_(body.user_emails)))
        .scalars()
        .all()
    )
    return [_to_model(row) for row in rows]
