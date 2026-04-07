from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.user import SetAllowedAddinsRequest, UserResponse
from app.services.user_service import get_user, set_allowed_addin_paths

router = APIRouter()


@router.get("/{email}", response_model=UserResponse | None)
def fetch_user(email: str, db: Session = Depends(get_db)) -> UserResponse | None:
    found = get_user(db, email)
    if not found:
        return None
    user, addins = found
    return UserResponse(
        userEmail=user.email,
        userName=user.name,
        discipline=user.discipline,
        role=user.role.value,
        allowedAddinIds=addins.allowed_addin_ids if addins else [],
        allowedAddinPaths=addins.allowed_addin_paths if addins else [],
    )


@router.put("/{email}/allowed-addin-paths")
def update_allowed_addin_paths(
    email: str, payload: SetAllowedAddinsRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    try:
        set_allowed_addin_paths(db, email, payload.addinPaths)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err)) from err
    return {"status": "ok"}
