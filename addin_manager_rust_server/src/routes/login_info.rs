use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::put;
use axum::{Json, Router};
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, EntityTrait};
use serde::{Deserialize, Serialize};

use crate::entities::login_info;
use crate::error::AppError;
use crate::rate_limit::{ClientAddr, Limit, enforce};
use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new().route(
        "/login-info/{user_email}",
        put(set_password).get(get_credentials),
    )
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetPasswordRequest {
    password_hash: String,
    salt: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LoginInfoResponse {
    user_email: String,
    password_hash: String,
    salt: String,
}

fn to_response(model: login_info::Model) -> LoginInfoResponse {
    LoginInfoResponse {
        user_email: model.user_email,
        password_hash: model.password_hash,
        salt: model.salt,
    }
}

async fn set_password(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
    Json(body): Json<SetPasswordRequest>,
) -> Result<StatusCode, AppError> {
    if let Some(user) = login_info::Entity::find_by_id(&user_email)
        .one(&state.db)
        .await?
    {
        let mut active: login_info::ActiveModel = user.into();
        active.password_hash = Set(body.password_hash);
        active.salt = Set(body.salt);
        active.update(&state.db).await?;
    } else {
        login_info::ActiveModel {
            user_email: Set(user_email),
            password_hash: Set(body.password_hash),
            salt: Set(body.salt),
        }
        .insert(&state.db)
        .await?;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn get_credentials(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
    Path(user_email): Path<String>,
) -> Result<Json<LoginInfoResponse>, AppError> {
    enforce(&state, &headers, addr, Limit::SixtyPerMinute)?;
    let user = login_info::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
    Ok(Json(to_response(user)))
}
