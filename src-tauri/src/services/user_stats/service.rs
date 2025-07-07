use std::path::Path;
use std::sync::Arc;

use crate::services::{
    addins_registry::services::local_registry::LocalAddinsRegistryService,
    local_addins::service::LocalAddinsService, user_stats::*,
};
use crate::{
    constants::Fut,
    services::{addins_registry::services::AddinsRegistry, local_db::service::LocalDbService},
};

pub struct UserStatsService {
    local_stats: Option<LocalUserStatsService>,
}

impl UserStatsService {
    pub async fn new_local_async(
        db: Arc<LocalDbService>,
        addins_registry: Arc<LocalAddinsRegistryService>,
        path_to_stats_db: &Path,
    ) -> Self {
        let local_stats =
            LocalUserStatsService::new_async(db, addins_registry, path_to_stats_db).await;
        Self {
            local_stats: Some(local_stats),
        }
    }
    pub fn get_service(&self) -> &dyn UserStats {
        if let Some(ref local_stats) = self.local_stats {
            return local_stats;
        }
        panic!("Only local stats are supported for now");
    }
}

impl UserStats for UserStatsService {
    fn get_user_stats(&self, user_email: String) -> Fut<Result<UserStatsModel, GetUserStatsError>> {
        self.get_service().get_user_stats(user_email)
    }
}
