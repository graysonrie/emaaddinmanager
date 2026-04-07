from app.core.security import create_token, hash_password, verify_password


def test_password_hash_roundtrip() -> None:
    password = "secret-password"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)


def test_create_token_returns_jwt_string() -> None:
    token = create_token("user@example.com", 30, "access")
    assert isinstance(token, str)
    assert len(token.split(".")) == 3
