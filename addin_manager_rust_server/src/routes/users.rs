use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, post};
use axum::{Json, Router};
use sea_orm::{ConnectionTrait, DatabaseBackend, Statement, TransactionTrait, Value};
use serde::Deserialize;

use crate::error::AppError;
use crate::state::AppState;

const TABLES: [&str; 4] = ["user_stats", "user_addins", "user_metadata", "login_info"];

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/users/change-email", post(change_email))
        .route("/users/{user_email}", delete(unregister_user))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChangeEmailRequest {
    user_email: String,
    new_user_email: String,
}

async fn change_email(
    State(state): State<AppState>,
    Json(body): Json<ChangeEmailRequest>,
) -> Result<StatusCode, AppError> {
    let txn = state.db.begin().await?;
    for table in TABLES {
        let sql = format!("UPDATE {table} SET user_email = $1 WHERE user_email = $2");
        let statement = Statement::from_sql_and_values(
            DatabaseBackend::Postgres,
            sql,
            [
                Value::from(body.new_user_email.clone()),
                Value::from(body.user_email.clone()),
            ],
        );
        txn.execute_raw(statement).await?;
    }
    txn.commit().await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn unregister_user(
    State(state): State<AppState>,
    Path(user_email): Path<String>,
) -> Result<StatusCode, AppError> {
    let txn = state.db.begin().await?;
    for table in TABLES {
        let sql = format!("DELETE FROM {table} WHERE user_email = $1");
        let statement = Statement::from_sql_and_values(
            DatabaseBackend::Postgres,
            sql,
            [Value::from(user_email.clone())],
        );
        txn.execute_raw(statement).await?;
    }
    txn.commit().await?;
    Ok(StatusCode::NO_CONTENT)
}
