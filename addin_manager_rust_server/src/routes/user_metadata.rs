use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{post, put};
use axum::{Json, Router};
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::entities::user_metadata;
use crate::error::AppError;
use crate::rate_limit::{ClientAddr, Limit, enforce};
use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/user-metadata/query", post(query))
        .route(
            "/user-metadata/{user_email}/get-or-create",
            post(get_or_create),
        )
        .route("/user-metadata/{user_email}", put(set_metadata))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SetMetadataRequest {
    metadata: Value,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MetadataQueryRequest {
    user_emails: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserMetadataResponse {
    user_email: String,
    metadata: Value,
}

fn to_response(model: user_metadata::Model) -> UserMetadataResponse {
    UserMetadataResponse {
        user_email: model.user_email,
        metadata: model.metadata,
    }
}

async fn get_or_create(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
) -> Result<Json<UserMetadataResponse>, AppError> {
    if let Some(user) = user_metadata::Entity::find_by_id(&user_email)
        .one(&state.db)
        .await?
    {
        return Ok(Json(to_response(user)));
    }

    let model = user_metadata::ActiveModel {
        user_email: Set(user_email),
        metadata: Set(json!({ "appVersion": null })),
    }
    .insert(&state.db)
    .await?;
    Ok(Json(to_response(model)))
}

async fn set_metadata(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
    Json(body): Json<SetMetadataRequest>,
) -> Result<StatusCode, AppError> {
    if let Some(user) = user_metadata::Entity::find_by_id(&user_email)
        .one(&state.db)
        .await?
    {
        let mut active: user_metadata::ActiveModel = user.into();
        active.metadata = Set(body.metadata);
        active.update(&state.db).await?;
    } else {
        user_metadata::ActiveModel {
            user_email: Set(user_email),
            metadata: Set(body.metadata),
        }
        .insert(&state.db)
        .await?;
    }
    Ok(StatusCode::NO_CONTENT)
}

async fn query(
    State(state): State<AppState>,
    headers: HeaderMap,
    ClientAddr(addr): ClientAddr,
    Json(body): Json<MetadataQueryRequest>,
) -> Result<Json<Vec<UserMetadataResponse>>, AppError> {
    enforce(&state, &headers, addr, Limit::ThirtyPerMinute)?;
    let rows = user_metadata::Entity::find()
        .filter(user_metadata::Column::UserEmail.is_in(body.user_emails))
        .all(&state.db)
        .await?;
    Ok(Json(rows.into_iter().map(to_response).collect()))
}
