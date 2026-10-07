use axum::Json;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use sea_orm::DbErr;
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    NotFound(String),
    Conflict(String),
    RateLimited,
    Internal(String),
}

impl AppError {
    pub fn status_and_detail(&self) -> (StatusCode, String) {
        match self {
            AppError::BadRequest(detail) => (StatusCode::BAD_REQUEST, detail.clone()),
            AppError::Unauthorized(detail) => (StatusCode::UNAUTHORIZED, detail.clone()),
            AppError::NotFound(detail) => (StatusCode::NOT_FOUND, detail.clone()),
            AppError::Conflict(detail) => (StatusCode::CONFLICT, detail.clone()),
            AppError::RateLimited => (
                StatusCode::TOO_MANY_REQUESTS,
                "Rate limit exceeded".to_string(),
            ),
            AppError::Internal(detail) => (StatusCode::INTERNAL_SERVER_ERROR, detail.clone()),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, detail) = self.status_and_detail();
        (status, Json(json!({ "detail": detail }))).into_response()
    }
}

impl From<DbErr> for AppError {
    fn from(error: DbErr) -> Self {
        tracing::error!(%error, "database request failed");
        AppError::Internal("Internal Server Error".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unauthorized_uses_api_key_detail() {
        let error = AppError::Unauthorized("Invalid or missing API key".to_string());
        let (status, detail) = error.status_and_detail();
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        assert_eq!(detail, "Invalid or missing API key");
    }

    #[test]
    fn rate_limit_is_429() {
        let (status, detail) = AppError::RateLimited.status_and_detail();
        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(detail, "Rate limit exceeded");
    }
}
