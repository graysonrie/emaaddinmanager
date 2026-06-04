from fastapi import Header, HTTPException, status

from app.config import get_settings

API_KEY_HEADER = "X-API-Key"


async def require_api_key(x_api_key: str | None = Header(default=None, alias=API_KEY_HEADER)) -> None:
    """FastAPI dependency that enforces the shared API key.

    Clients must send the configured key in the `X-API-Key` header.
    """
    expected = get_settings().api_key
    if not x_api_key or x_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
