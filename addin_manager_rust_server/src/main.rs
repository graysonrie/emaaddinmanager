mod auth;
mod config;
mod db;
mod entities;
mod error;
mod rate_limit;
mod routes;
mod seed;
mod state;
mod util;

use anyhow::Context;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_tracing();
    let _ = dotenvy::dotenv();

    let config = config::Config::from_env()?;
    config.validate_seed_assets()?;

    let db = db::connect(&config.database_url)
        .await
        .context("failed to connect to postgres")?;
    db::create_tables(&db)
        .await
        .context("failed to create tables")?;
    seed::run(&db, &config.sqlite_seed_path).await?;

    let state = state::AppState::new(db, config.api_key);
    routes::serve(state, config.port).await
}

fn init_tracing() {
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
}
