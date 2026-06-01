from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_api_key
from app.database import get_db
from app.models import LoginInfo
from app.schemas import LoginInfoModel, SetPasswordRequest

router = APIRouter(
    prefix="/login-info",
    tags=["login-info"],
    dependencies=[Depends(require_api_key)],
)


@router.put("/{user_email}", status_code=status.HTTP_204_NO_CONTENT)
def set_password(user_email: str, body: SetPasswordRequest, db: Session = Depends(get_db)) -> None:
    user = db.get(LoginInfo, user_email)
    if user is None:
        db.add(
            LoginInfo(
                user_email=user_email,
                password_hash=body.password_hash,
                salt=body.salt,
            )
        )
    else:
        user.password_hash = body.password_hash
        user.salt = body.salt
    db.commit()


@router.get("/{user_email}", response_model=LoginInfoModel)
def get_credentials(user_email: str, db: Session = Depends(get_db)) -> LoginInfo:
    user = db.get(LoginInfo, user_email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user
