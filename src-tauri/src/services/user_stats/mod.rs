use crate::constants::Fut;
mod models;
pub use models::*;
mod service;
pub use service::*;
mod services;
pub use services::*;

pub enum GetUserStatsError {
    DatabaseError(String),
    UserNotFound,
    LocalAddinsError(String),
}

pub trait UserStats {
    fn get_user_stats(&self, user_email: String) -> Fut<Result<UserStatsModel, GetUserStatsError>>;
}
