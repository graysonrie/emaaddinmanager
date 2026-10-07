use std::sync::Arc;

use sea_orm::DatabaseConnection;

use crate::rate_limit::IpLimiter;

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub api_key: String,
    pub limit_10: Arc<IpLimiter>,
    pub limit_30: Arc<IpLimiter>,
    pub limit_60: Arc<IpLimiter>,
}

impl AppState {
    pub fn new(db: DatabaseConnection, api_key: String) -> Self {
        Self {
            db,
            api_key,
            limit_10: Arc::new(IpLimiter::per_minute(10)),
            limit_30: Arc::new(IpLimiter::per_minute(30)),
            limit_60: Arc::new(IpLimiter::per_minute(60)),
        }
    }
}
