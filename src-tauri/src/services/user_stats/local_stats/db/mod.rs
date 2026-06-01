use serde_json::json;

pub mod client;
pub mod login_info;
pub mod user_addins;
pub mod user_metadata;
pub mod user_stats;
use client::StatsApiClient;
use user_addins::UserAddinsTable;
use user_metadata::UserMetadataTable;
use user_stats::UserStatsTable;

use crate::services::user_stats::db::login_info::LoginInfoTable;

pub struct LocalStatsDbHandler {
    user_stats_table: UserStatsTable,
    user_addins_table: UserAddinsTable,
    user_metadata_table: UserMetadataTable,
    login_info_table: LoginInfoTable,
    client: StatsApiClient,
}

impl LocalStatsDbHandler {
    /// Creates a new handler that talks to the standalone stats server.
    ///
    /// The server base URL and API key are read from configuration
    /// (`STATS_SERVER_URL` / `STATS_SERVER_API_KEY`).
    pub async fn new_async() -> Result<Self, String> {
        let client = StatsApiClient::new();
        let user_stats_table = UserStatsTable::new(client.clone());
        let user_addins_table = UserAddinsTable::new(client.clone());
        let user_metadata_table = UserMetadataTable::new(client.clone());
        let login_info_table = LoginInfoTable::new(client.clone());
        Ok(Self {
            user_stats_table,
            user_addins_table,
            user_metadata_table,
            login_info_table,
            client,
        })
    }

    pub fn user_stats_table(&self) -> &UserStatsTable {
        &self.user_stats_table
    }

    pub fn user_addins_table(&self) -> &UserAddinsTable {
        &self.user_addins_table
    }

    pub fn user_metadata_table(&self) -> &UserMetadataTable {
        &self.user_metadata_table
    }

    pub fn login_info_table(&self) -> &LoginInfoTable {
        &self.login_info_table
    }

    /// Changes a user's email across every stats table in a single,
    /// server-side transactional operation.
    pub async fn change_email_transactional(
        &self,
        user_email: &str,
        new_user_email: &str,
    ) -> Result<(), String> {
        self.client
            .post_no_content(
                "/users/change-email",
                &json!({
                    "userEmail": user_email,
                    "newUserEmail": new_user_email,
                }),
            )
            .await
    }

    /// Removes a user from every stats table in a single, server-side
    /// transactional operation.
    pub async fn unregister_user_transactional(&self, user_email: &str) -> Result<(), String> {
        self.client
            .delete_no_content(&format!("/users/{user_email}"))
            .await
    }
}
