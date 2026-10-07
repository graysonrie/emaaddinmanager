use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct StatusBody {
    pub status: &'static str,
}

pub async fn health() -> Json<StatusBody> {
    Json(StatusBody { status: "ok" })
}

pub async fn ping() -> Json<StatusBody> {
    Json(StatusBody { status: "ok" })
}
