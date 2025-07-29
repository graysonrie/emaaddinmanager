use std::{fmt::Display, sync::Arc};
use tauri::AppHandle;

use crate::services::{
    addin_updater::{
        update_checker::{AddinUpdateChecker, UpdateResult},
        *,
    },
    addins_registry::services::AsyncAddinsRegistryServiceType,
    admin::service::AdminService,
    local_db::service::LocalDbService,
    user_stats::LocalUserStatsService,
};

#[derive(Debug)]
pub enum CheckForUpdatesError {
    Update(String),
}
impl Display for CheckForUpdatesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

/// A service to manage the background update checker.
pub struct AddinUpdaterService {
    pub update_checker: AddinUpdateChecker,
}

impl AddinUpdaterService {
    pub fn new(
        addins_registry: AsyncAddinsRegistryServiceType,
        app_handle: AppHandle,
        user_stats: Arc<LocalUserStatsService>,
        db: Arc<LocalDbService>,
        admin_service: Arc<AdminService>,
    ) -> Self {
        let update_checker = update_checker::AddinUpdateChecker::new(
            app_handle,
            addins_registry.clone(),
            user_stats,
            db,
            admin_service,
        );
        update_checker.spawn_update_checker();
        Self { update_checker }
    }
    pub async fn manually_check_for_updates(&self) -> Result<UpdateResult, String> {
        self.update_checker.manual_check_for_updates().await
    }
}
