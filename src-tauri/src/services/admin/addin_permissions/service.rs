use std::sync::Arc;

use crate::services::{
    admin::addin_permissions::models::user::UserModel,
    user_stats::{db::user_addins::UserAddinsTable, LocalUserStatsService},
};

pub struct AddinPermissionsService {
    local_stats: Arc<LocalUserStatsService>,
}

impl AddinPermissionsService {
    pub fn new(local_stats: Arc<LocalUserStatsService>) -> Self {
        Self { local_stats }
    }

    /// Registers a new user in the database
    ///
    /// Returns the user model if the user is registered successfully
    ///
    /// Returns an error if the user is not registered successfully
    pub async fn register_user(
        &self,
        user_email: String,
        user_discipline: String,
    ) -> Result<UserModel, String> {
        let table = self.get_table();
        let user = table
            .create_user(user_email, user_discipline)
            .await
            .map_err(|e| e.to_string())?;
        let user_model = user
            .try_into()
            .map_err(|e: serde_json::Error| e.to_string())?;
        Ok(user_model)
    }

    pub async fn get_user(&self, user_email: String) -> Result<Option<UserModel>, String> {
        let table = self.get_table();
        let user = table
            .get_user(user_email)
            .await
            .map_err(|e| e.to_string())?;
        let user_model = user
            .map(|user| {
                user.try_into()
                    .map_err(|e: serde_json::Error| e.to_string())
            })
            .transpose()?;
        Ok(user_model)
    }

    pub async fn add_allowed_addin_paths(
        &self,
        user_email: String,
        addin_paths: Vec<String>,
    ) -> Result<(), String> {
        let table = self.get_table();
        table
            .add_allowed_addin_paths(user_email, addin_paths)
            .await
            .map_err(|e| e.to_string())
    }

    pub async fn remove_allowed_addin_paths(
        &self,
        user_email: String,
        addin_paths: Vec<String>,
    ) -> Result<(), String> {
        let table = self.get_table();
        table
            .remove_allowed_addin_paths(user_email, addin_paths)
            .await
            .map_err(|e| e.to_string())
    }

    fn get_table(&self) -> &UserAddinsTable {
        self.local_stats.stats_db.user_addins_table()
    }
}
