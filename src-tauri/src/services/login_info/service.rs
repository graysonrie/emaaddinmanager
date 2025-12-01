use std::sync::Arc;

use db_manager::db::login_table::login_info;

use crate::services::{
    config, local_db::service::LocalDbService, user_stats::LocalUserStatsService,
};

pub struct LoginInfoService {
    local_db: Arc<LocalDbService>,
    local_stats: Arc<LocalUserStatsService>,
}

impl LoginInfoService {
    pub fn new(local_db: Arc<LocalDbService>, local_stats: Arc<LocalUserStatsService>) -> Self {
        Self { local_db, local_stats }
    }

    /// Set the password for the current user with this email
    pub async fn set_password(&self, password: String) -> Result<(), String> {
        let current_email = config::keys::get_user_email(self.local_db.clone()).await?;

        let login_model = self.generate_login_info_model(current_email, password)?;

        Ok(())
    }

    fn generate_login_info_model(
        &self,
        user_email: String,
        password: String,
    ) -> Result<login_info::Model, String> {
        Ok(login_info::Model {
            user_email,
            password_hash,
            salt,
        })
    }
}
