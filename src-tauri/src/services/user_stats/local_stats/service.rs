use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::addins_registry::services::local_registry::LocalAddinsRegistryService;
use crate::services::addins_registry::services::AddinsRegistry;
use crate::services::config::keys;
use crate::services::local_addins::service::LocalAddinsService;
use crate::services::local_db::service::LocalDbService;
use crate::services::user_stats::db::LocalStatsDbHandler;
use crate::services::user_stats::*;
use std::sync::Arc;

pub struct LocalUserStatsService {
    local_db: Arc<LocalDbService>,
    addins_registry: Arc<LocalAddinsRegistryService>,
    pub stats_db: LocalStatsDbHandler,
}

impl LocalUserStatsService {
    pub async fn new_async(
        db: Arc<LocalDbService>,
        addins_registry: Arc<LocalAddinsRegistryService>,
    ) -> Result<Self, String> {
        let stats_db = LocalStatsDbHandler::new_async().await?;
        Ok(Self {
            local_db: db,
            addins_registry,
            stats_db,
        })
    }

    pub async fn get_all_user_stats(&self) -> Result<Vec<UserStatsModel>, String> {
        let table = self.stats_db.user_stats_table();
        table.get_all_user_stats().await.map_err(|e| e.to_string())
    }

    /// Lightweight list of every user (counts + app version).
    pub async fn get_user_stats_summary(&self) -> Result<Vec<UserStatsSummaryModel>, String> {
        let table = self.stats_db.user_stats_table();
        table
            .get_user_stats_summary()
            .await
            .map_err(|e| e.to_string())
    }

    /// Returns the full stats for a single user, or None if the user does not exist.
    pub async fn get_user_stats(
        &self,
        user_email: String,
    ) -> Result<Option<UserStatsModel>, String> {
        let table = self.stats_db.user_stats_table();
        let user = table.get_user(user_email).await?;
        Ok(user.map(UserStatsModel::from))
    }

    /// Refreshes the user stats for the user that is currently using the app
    ///
    /// Returns the user stats of the user that is currently using the app, or None if the user does not exist
    pub async fn refresh_user_stats(&self) -> Result<Option<UserStatsModel>, String> {
        let user_email = keys::get_user_email(self.local_db.clone()).await?;
        let disciplines = keys::get_user_disciplines(self.local_db.clone()).await?;

        let published_addins = self.get_published_addins().await?;
        let installed_addins = self.get_installed_addins()?;

        let table = self.stats_db.user_stats_table();

        // Refresh the user stats:
        table
            .upsert_user_stats_fields(
                &user_email,
                published_addins,
                installed_addins,
                disciplines,
            )
            .await?;

        // Return the user with the updated stats:
        let user_stats = table.get_user(user_email.clone()).await?;
        let user_stats = user_stats.map(UserStatsModel::from);
        Ok(user_stats)
    }

    pub async fn does_user_exist(&self, user_email: String) -> Result<bool, String> {
        let table = self.stats_db.user_stats_table();
        let user_stats = table.get_user(user_email).await?;
        Ok(user_stats.is_some())
    }

    async fn get_published_addins(&self) -> Result<Vec<PublishedAddinModel>, String> {
        let user_email = keys::get_user_email(self.local_db.clone()).await?;

        let all_addins = self
            .addins_registry
            .get_addins()
            .await
            .map_err(|e| e.to_string())?;

        let user_addins = all_addins
            .iter()
            .filter(|addin| addin.email == user_email)
            .collect::<Vec<&AddinModel>>();

        let published_addins = user_addins
            .into_iter()
            .map(|addin| PublishedAddinModel::from(addin.clone()))
            .collect::<Vec<PublishedAddinModel>>();

        Ok(published_addins)
    }

    fn get_installed_addins(&self) -> Result<Vec<InstalledAddinModel>, String> {
        let local_addins = LocalAddinsService::get_local_addins().map_err(|e| e.to_string())?;

        let installed_addins = local_addins
            .into_iter()
            .map(|addin| InstalledAddinModel::from(addin.clone()))
            .collect::<Vec<InstalledAddinModel>>();

        Ok(installed_addins)
    }
}
