use crate::constants::Fut;
mod models;
pub use models::*;
mod service;
pub use service::*;
mod services;
pub use services::*;

pub enum GetUserStatsError {
    DatabaseError(String),
    LocalAddinsError(String),
}

pub trait UserStats {
    fn get_user_stats(&self) -> Fut<Result<UserStatsModel, GetUserStatsError>>;
}
