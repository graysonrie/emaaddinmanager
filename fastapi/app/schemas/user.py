from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    userEmail: EmailStr
    userName: str
    discipline: str
    role: str
    allowedAddinIds: list[str] = []
    allowedAddinPaths: list[str] = []


class SetAllowedAddinsRequest(BaseModel):
    addinPaths: list[str]
