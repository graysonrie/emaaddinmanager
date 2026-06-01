use db_manager::db::user_addins_table::*;
use serde_json::json;
use std::fmt::Display;

use crate::services::user_stats::db::client::StatsApiClient;

pub struct UserAddinsTable {
    client: StatsApiClient,
}

#[derive(Debug)]
pub enum UserAddinsError {
    UserNotFound,
    Request(String),
    SerializationError(String),
}
impl Display for UserAddinsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl UserAddinsTable {
    pub fn new(client: StatsApiClient) -> Self {
        Self { client }
    }

    pub async fn create_user(
        &self,
        user_email: String,
        user_discipline: String,
    ) -> Result<user::Model, UserAddinsError> {
        self.client
            .post_json(
                "/user-addins",
                &json!({
                    "userEmail": user_email,
                    "discipline": user_discipline,
                }),
            )
            .await
            .map_err(UserAddinsError::Request)
    }

    pub async fn get_user(
        &self,
        user_email: String,
    ) -> Result<Option<user::Model>, UserAddinsError> {
        self.client
            .get_opt(&format!("/user-addins/{user_email}"))
            .await
            .map_err(UserAddinsError::Request)
    }

    pub async fn set_allowed_addin_paths(
        &self,
        user_email: String,
        paths: Vec<String>,
    ) -> Result<(), UserAddinsError> {
        // The server sorts and de-duplicates the paths.
        self.client
            .put_no_content(
                &format!("/user-addins/{user_email}/allowed-paths"),
                &json!({ "paths": paths }),
            )
            .await
            .map_err(UserAddinsError::Request)
    }
}
