use std::sync::Arc;

use crate::services::{
    config::keys,
    local_db::service::LocalDbService,
    user_stats::{
        db::user_metadata::models::{MetadataBody, UserMetadataModel},
        LocalUserStatsService,
    },
};

pub struct UserMetadataService {
    local_db: Arc<LocalDbService>,
    stats: Arc<LocalUserStatsService>,
}

impl UserMetadataService {
    pub fn new(local_db: Arc<LocalDbService>, stats: Arc<LocalUserStatsService>) -> Self {
        Self { local_db, stats }
    }
    pub async fn set_version_metadata(&self, version: String) -> Result<(), String> {
        let user_email = keys::get_user_email(self.local_db.clone()).await?;

        let table = self.stats.stats_db.user_metadata_table();
        let metadata = MetadataBody {
            app_version: Some(version),
        };
        table.set_metadata(user_email, metadata).await?;
        Ok(())
    }
    pub async fn get_user_metadata(&self, user_email: String) -> Result<UserMetadataModel, String> {
        let table = self.stats.stats_db.user_metadata_table();
        table.get_or_create_metadata(user_email).await
    }
    pub async fn get_user_metadata_many(
        &self,
        user_emails: Vec<String>,
    ) -> Result<Vec<UserMetadataModel>, String> {
        let table = self.stats.stats_db.user_metadata_table();
        table.get_metadata_many(user_emails).await
    }
}
