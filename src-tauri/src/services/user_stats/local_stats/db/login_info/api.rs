use db_manager::db::login_table::login_info;
use serde_json::json;

use crate::services::user_stats::db::client::StatsApiClient;

pub struct LoginInfoTable {
    client: StatsApiClient,
}

impl LoginInfoTable {
    pub fn new(client: StatsApiClient) -> Self {
        Self { client }
    }

    pub async fn set_user_password(
        &self,
        user_email: String,
        hashed_password: String,
        salt: String,
    ) -> Result<(), String> {
        self.client
            .put_no_content(
                &format!("/login-info/{user_email}"),
                &json!({
                    "passwordHash": hashed_password,
                    "salt": salt,
                }),
            )
            .await
    }

    /// Will return the hashed password and the salt, not plaintext!!
    pub async fn get_user_credentials(
        &self,
        user_email: String,
    ) -> Result<Option<login_info::Model>, String> {
        self.client
            .get_opt(&format!("/login-info/{user_email}"))
            .await
    }
}
