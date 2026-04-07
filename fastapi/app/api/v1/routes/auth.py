from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, SetPasswordRequest, TempPasswordRequest, TokenResponse
from app.services.auth_service import login_user, register_user, set_password, set_temporary_password

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        _, access, refresh = register_user(
            db,
            email=payload.email,
            name=payload.name,
            discipline=payload.discipline,
            password=payload.password,
        )
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err)) from err

    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        _, access, refresh = login_user(db, email=payload.email, password=payload.password)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(err)) from err
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/set-password/{email}")
def set_password_for_user(email: str, payload: SetPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        set_password(db, email=email, password=payload.password)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err)) from err
    return {"status": "ok"}


@router.post("/set-temp-password")
def set_temp_password(payload: TempPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        temp_password = set_temporary_password(db, email=payload.email)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err)) from err
    return {"temporaryPassword": temp_password}
