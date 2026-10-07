use std::collections::HashSet;

use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, EntityTrait, TransactionTrait};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::entities::user_addins;
use crate::error::AppError;
use crate::rate_limit::{ClientAddr, Limit, enforce};
use crate::state::AppState;
use crate::util::{block_path, clean_paths, json_string_list, string_list_to_json, unblock_path};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/user-addins", post(create_user))
        .route("/user-addins/block-path-for-all", post(block_path_for_all))
        .route(
            "/user-addins/unblock-path-for-all",
            post(unblock_path_for_all),
        )
        .route("/user-addins/{user_email}", get(get_user))
        .route(
            "/user-addins/{user_email}/allowed-paths",
            put(set_allowed_paths),
        )
        .route(
            "/user-addins/{user_email}/blocked-paths",
            put(set_blocked_paths),
        )
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateUserAddinsRequest {
    user_email: String,
    discipline: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetPathsRequest {
    paths: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BlockPathForAllRequest {
    path: String,
    #[serde(default)]
    exclude_emails: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UnblockPathForAllRequest {
    path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserAddinsResponse {
    user_email: String,
    allowed_addin_ids: Value,
    allowed_addin_paths: Value,
    blocked_addin_paths: Value,
    discipline: String,
}

fn to_response(model: user_addins::Model) -> UserAddinsResponse {
    UserAddinsResponse {
        user_email: model.user_email,
        allowed_addin_ids: model.allowed_addin_ids,
        allowed_addin_paths: model.allowed_addin_paths,
        blocked_addin_paths: model.blocked_addin_paths,
        discipline: model.discipline,
    }
}

async fn create_user(
    State(state): State<AppState>,
    Json(body): Json<CreateUserAddinsRequest>,
) -> Result<(StatusCode, Json<UserAddinsResponse>), AppError> {
    if user_addins::Entity::find_by_id(&body.user_email)
        .one(&state.db)
        .await?
        .is_some()
    {
        return Err(AppError::Conflict("User already exists".to_string()));
    }

    let model = user_addins::ActiveModel {
        user_email: Set(body.user_email),
        allowed_addin_ids: Set(serde_json::json!([])),
        allowed_addin_paths: Set(serde_json::json!([])),
        blocked_addin_paths: Set(serde_json::json!([])),
        discipline: Set(body.discipline),
    }
    .insert(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(to_response(model))))
}

async fn get_user(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
    Path(user_email): Path<String>,
) -> Result<Json<UserAddinsResponse>, AppError> {
    enforce(&state, &headers, addr, Limit::SixtyPerMinute)?;
    let user = user_addins::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
    Ok(Json(to_response(user)))
}

async fn set_allowed_paths(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
    Json(body): Json<SetPathsRequest>,
) -> Result<StatusCode, AppError> {
    replace_paths(&state, user_email, body.paths, true).await
}

async fn set_blocked_paths(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
    Json(body): Json<SetPathsRequest>,
) -> Result<StatusCode, AppError> {
    replace_paths(&state, user_email, body.paths, false).await
}

async fn replace_paths(
    state: &AppState,
    user_email: String,
    paths: Vec<String>,
    allowed: bool,
) -> Result<StatusCode, AppError> {
    let Some(user) = user_addins::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
    else {
        return Err(AppError::NotFound("User not found".to_string()));
    };

    let cleaned = string_list_to_json(&clean_paths(paths));
    let mut active: user_addins::ActiveModel = user.into();
    if allowed {
        active.allowed_addin_paths = Set(cleaned);
    } else {
        active.blocked_addin_paths = Set(cleaned);
    }
    active.update(&state.db).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn block_path_for_all(
    State(state): State<AppState>,
    Json(body): Json<BlockPathForAllRequest>,
) -> Result<StatusCode, AppError> {
    let excluded: HashSet<String> = body.exclude_emails.into_iter().collect();
    let txn = state.db.begin().await?;
    let users = user_addins::Entity::find().all(&txn).await?;
    for user in users {
        if excluded.contains(&user.user_email) {
            continue;
        }
        let existing = json_string_list(&user.blocked_addin_paths);
        let Some(next) = block_path(&existing, &body.path) else {
            continue;
        };
        let mut active: user_addins::ActiveModel = user.into();
        active.blocked_addin_paths = Set(string_list_to_json(&next));
        active.update(&txn).await?;
    }
    txn.commit().await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn unblock_path_for_all(
    State(state): State<AppState>,
    Json(body): Json<UnblockPathForAllRequest>,
) -> Result<StatusCode, AppError> {
    let txn = state.db.begin().await?;
    let users = user_addins::Entity::find().all(&txn).await?;
    for user in users {
        let existing = json_string_list(&user.blocked_addin_paths);
        let Some(next) = unblock_path(&existing, &body.path) else {
            continue;
        };
        let mut active: user_addins::ActiveModel = user.into();
        active.blocked_addin_paths = Set(string_list_to_json(&next));
        active.update(&txn).await?;
    }
    txn.commit().await?;
    Ok(StatusCode::NO_CONTENT)
}
