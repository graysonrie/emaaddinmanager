from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model that serializes/parses using camelCase keys.

    This keeps the JSON contract aligned with the Rust entities, which use
    `#[serde(rename_all = "camelCase")]`.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# --- user_stats ---


class UserStatsModel(CamelModel):
    user_email: str
    user_name: str
    published_addins: Any
    installed_addins: Any
    disciplines: Any


class CreateUserStatsRequest(CamelModel):
    user_email: str
    user_name: str


class ChangeNameRequest(CamelModel):
    user_name: str


class UpsertFieldsRequest(CamelModel):
    published_addins: Any
    installed_addins: Any
    disciplines: Any


# --- user_addins ---


class UserAddinsModel(CamelModel):
    user_email: str
    allowed_addin_ids: Any
    allowed_addin_paths: Any
    discipline: str


class CreateUserAddinsRequest(CamelModel):
    user_email: str
    discipline: str


class SetAllowedPathsRequest(CamelModel):
    paths: list[str]


# --- user_metadata ---


class UserMetadataModel(CamelModel):
    user_email: str
    metadata: Any


class SetMetadataRequest(CamelModel):
    metadata: Any


class MetadataQueryRequest(CamelModel):
    user_emails: list[str]


# --- login_info ---


class LoginInfoModel(CamelModel):
    user_email: str
    password_hash: str
    salt: str


class SetPasswordRequest(CamelModel):
    password_hash: str
    salt: str


# --- cross-table ---


class ChangeEmailRequest(CamelModel):
    user_email: str
    new_user_email: str
