use std::net::SocketAddr;

use axum::Router;
use axum::middleware;
use axum::routing::get;
use tower_http::compression::CompressionLayer;
use tower_http::compression::predicate::SizeAbove;

use crate::auth::require_api_key;
use crate::state::AppState;

mod health;
mod login_info;
mod user_addins;
mod user_metadata;
mod user_stats;
mod users;

pub fn router(state: AppState) -> Router {
    let protected = Router::new()
        .route("/ping", get(health::ping))
        .merge(user_stats::routes())
        .merge(user_addins::routes())
        .merge(user_metadata::routes())
        .merge(login_info::routes())
        .merge(users::routes())
        .layer(middleware::from_fn_with_state(
            state.clone(),
            require_api_key,
        ));

    Router::new()
        .route("/health", get(health::health))
        .merge(protected)
        .layer(CompressionLayer::new().compress_when(SizeAbove::new(500)))
        .with_state(state)
}

pub async fn serve(state: AppState, port: u16) -> anyhow::Result<()> {
    let app = router(state);
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", port)).await?;
    tracing::info!("listening on 0.0.0.0:{port}");
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;
    Ok(())
}
