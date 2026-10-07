use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::response::Response;

use crate::error::AppError;
use crate::state::AppState;

pub async fn require_api_key(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    let provided = request
        .headers()
        .get("x-api-key")
        .and_then(|value| value.to_str().ok());

    match provided {
        Some(key) if !key.is_empty() && key == state.api_key => Ok(next.run(request).await),
        _ => Err(AppError::Unauthorized(
            "Invalid or missing API key".to_string(),
        )),
    }
}
