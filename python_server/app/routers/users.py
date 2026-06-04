from fastapi import APIRouter, Depends, status
from sqlalchemy import delete, update
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import LoginInfo, UserAddins, UserMetadata, UserStats
from app.schemas import ChangeEmailRequest

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(require_api_key)],
)

_TABLES = (UserStats, UserAddins, UserMetadata, LoginInfo)


@router.post("/change-email", status_code=status.HTTP_204_NO_CONTENT)
def change_email(body: ChangeEmailRequest, db: Session = Depends(get_db)) -> None:
    """Atomically update user_email across every table."""
    for table in _TABLES:
        db.execute(
            update(table)
            .where(table.user_email == body.user_email)
            .values(user_email=body.new_user_email)
        )
    db.commit()


@router.delete("/{user_email}", status_code=status.HTTP_204_NO_CONTENT)
def unregister_user(user_email: str, db: Session = Depends(get_db)) -> None:
    """Atomically remove a user from every table."""
    for table in _TABLES:
        db.execute(delete(table).where(table.user_email == user_email))
    db.commit()
