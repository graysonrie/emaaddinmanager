use axum::extract::State;
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, EntityTrait};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::entities::user_stats;
use crate::error::AppError;
use crate::rate_limit::{ClientAddr, Limit, enforce};
use crate::state::AppState;
use crate::util::{app_version_from_metadata, distinct_installed_count, published_addins_count};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/user-stats", post(create_user).get(get_all))
        .route("/user-stats/summary", get(summary))
        .route("/user-stats/{user_email}", get(get_user).patch(change_name))
        .route("/user-stats/{user_email}/fields", put(upsert_fields))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateUserStatsRequest {
    user_email: String,
    user_name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChangeNameRequest {
    user_name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpsertFieldsRequest {
    published_addins: Value,
    installed_addins: Value,
    disciplines: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserStatsResponse {
    user_email: String,
    user_name: String,
    published_addins: Value,
    installed_addins: Value,
    disciplines: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserStatsSummaryResponse {
    user_email: String,
    user_name: String,
    disciplines: Value,
    published_addins_count: usize,
    installed_addins_count: usize,
    app_version: Option<String>,
}

fn to_response(model: user_stats::Model) -> UserStatsResponse {
    UserStatsResponse {
        user_email: model.user_email,
        user_name: model.user_name,
        published_addins: model.published_addins,
        installed_addins: model.installed_addins,
        disciplines: model.disciplines,
    }
}

async fn create_user(
    State(state): State<AppState>,
    Json(body): Json<CreateUserStatsRequest>,
) -> Result<(StatusCode, Json<UserStatsResponse>), AppError> {
    if body.user_email.is_empty() || body.user_name.is_empty() {
        return Err(AppError::BadRequest(
            "user_email and user_name are required".to_string(),
        ));
    }

    if user_stats::Entity::find_by_id(&body.user_email)
        .one(&state.db)
        .await?
        .is_some()
    {
        return Err(AppError::Conflict("User already exists".to_string()));
    }

    let model = user_stats::ActiveModel {
        user_email: Set(body.user_email),
        user_name: Set(body.user_name),
        published_addins: Set(serde_json::json!([])),
        installed_addins: Set(serde_json::json!([])),
        disciplines: Set(serde_json::json!([])),
        date_added: Set(None),
    }
    .insert(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(to_response(model))))
}

async fn get_all(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
) -> Result<Json<Vec<UserStatsResponse>>, AppError> {
    enforce(&state, &headers, addr, Limit::TenPerMinute)?;
    let rows = user_stats::Entity::find().all(&state.db).await?;
    Ok(Json(rows.into_iter().map(to_response).collect()))
}

async fn summary(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
) -> Result<Json<Vec<UserStatsSummaryResponse>>, AppError> {
    enforce(&state, &headers, addr, Limit::ThirtyPerMinute)?;

    let users = user_stats::Entity::find().all(&state.db).await?;
    let metadata_rows = crate::entities::user_metadata::Entity::find()
        .all(&state.db)
        .await?;
    let metadata_by_email: std::collections::HashMap<_, _> = metadata_rows
        .into_iter()
        .map(|row| (row.user_email, row.metadata))
        .collect();

    let summaries = users
        .into_iter()
        .map(|user| {
            let published_addins_count = published_addins_count(&user.published_addins);
            let installed_addins_count = distinct_installed_count(&user.installed_addins);
            let app_version = app_version_from_metadata(metadata_by_email.get(&user.user_email));
            UserStatsSummaryResponse {
                user_email: user.user_email,
                user_name: user.user_name,
                disciplines: user.disciplines,
                published_addins_count,
                installed_addins_count,
                app_version,
            }
        })
        .collect();
    Ok(Json(summaries))
}

async fn get_user(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
    axum::extract::Path(user_email): axum::extract::Path<String>,
) -> Result<Json<UserStatsResponse>, AppError> {
    enforce(&state, &headers, addr, Limit::SixtyPerMinute)?;
    let user = user_stats::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
    Ok(Json(to_response(user)))
}

async fn change_name(
    State(state): State<AppState>,
    axum::extract::Path(user_email): axum::extract::Path<String>,
    Json(body): Json<ChangeNameRequest>,
) -> Result<StatusCode, AppError> {
    if let Some(user) = user_stats::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
    {
        let mut active: user_stats::ActiveModel = user.into();
        active.user_name = Set(body.user_name);
        active.update(&state.db).await?;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn upsert_fields(
    State(state): State<AppState>,
    axum::extract::Path(user_email): axum::extract::Path<String>,
    Json(body): Json<UpsertFieldsRequest>,
) -> Result<StatusCode, AppError> {
    if let Some(user) = user_stats::Entity::find_by_id(user_email)
        .one(&state.db)
        .await?
    {
        let mut active: user_stats::ActiveModel = user.into();
        active.published_addins = Set(body.published_addins);
        active.installed_addins = Set(body.installed_addins);
        active.disciplines = Set(body.disciplines);
        active.update(&state.db).await?;
    }
    Ok(StatusCode::NO_CONTENT)
}
