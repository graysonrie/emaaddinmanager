use db_manager::db::user_stats_table::*;
use serde_json::json;

use crate::services::user_stats::db::client::StatsApiClient;
use crate::services::user_stats::*;

pub struct UserStatsTable {
    client: StatsApiClient,
}

impl UserStatsTable {
    pub fn new(client: StatsApiClient) -> Self {
        Self { client }
    }

    /// Creates a new user with the given email and name
    /// If the user already exists, this function will return an error
    pub async fn create_user(
        &self,
        user_email: String,
        user_name: String,
    ) -> Result<user::Model, String> {
        // Ensure that the user name and email are not empty
        Self::err_if_str_is_empty(&user_email, "user_email")?;
        Self::err_if_str_is_empty(&user_name, "user_name")?;

        self.client
            .post_json(
                "/user-stats",
                &json!({
                    "userEmail": user_email,
                    "userName": user_name,
                }),
            )
            .await
    }

    /// Returns None if the user does not exist
    pub async fn get_user(&self, user_email: String) -> Result<Option<user::Model>, String> {
        self.client
            .get_opt(&format!("/user-stats/{user_email}"))
            .await
    }

    pub async fn change_name(
        &self,
        user_email: String,
        new_user_name: String,
    ) -> Result<(), String> {
        self.client
            .patch_no_content(
                &format!("/user-stats/{user_email}"),
                &json!({ "userName": new_user_name }),
            )
            .await
    }

    pub async fn upsert_user_stats_fields(
        &self,
        user_email: &str,
        published_addins: Vec<PublishedAddinModel>,
        installed_addins: Vec<InstalledAddinModel>,
        disciplines: Vec<String>,
    ) -> Result<(), String> {
        self.client
            .put_no_content(
                &format!("/user-stats/{user_email}/fields"),
                &json!({
                    "publishedAddins": published_addins,
                    "installedAddins": installed_addins,
                    "disciplines": disciplines,
                }),
            )
            .await
    }

    pub async fn get_all_user_stats(&self) -> Result<Vec<UserStatsModel>, String> {
        let users: Vec<user::Model> = self.client.get("/user-stats").await?;
        let user_stats = users.into_iter().map(UserStatsModel::from).collect();
        Ok(user_stats)
    }

    // Util:
    fn err_if_str_is_empty(str: &str, value_name: &str) -> Result<(), String> {
        if str.is_empty() {
            return Err(format!(
                "The value {} cannot be empty, received an empty value",
                value_name
            ));
        }
        Ok(())
    }
}
