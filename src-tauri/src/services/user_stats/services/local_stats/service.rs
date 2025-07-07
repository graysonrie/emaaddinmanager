use crate::services::addins_registry::services::local_registry::LocalAddinsRegistryService;
use crate::services::user_stats::db::LocalStatsDbHandler;
use crate::{
    constants::Fut,
    services::{local_db::service::LocalDbService, user_stats::*},
};
use std::path::Path;
use std::sync::Arc;

pub struct LocalUserStatsService {
    local_db: Arc<LocalDbService>,
    addins_registry: Arc<LocalAddinsRegistryService>,
    stats_db: LocalStatsDbHandler,
}

impl LocalUserStatsService {
    pub async fn new_async(
        db: Arc<LocalDbService>,
        addins_registry: Arc<LocalAddinsRegistryService>,
        path_to_stats_db: &Path,
    ) -> Self {
        let stats_db = LocalStatsDbHandler::new_async(path_to_stats_db).await;
        Self {
            local_db: db,
            addins_registry,
            stats_db,
        }
    }
}

impl UserStats for LocalUserStatsService {
    fn get_user_stats(&self, user_email: String) -> Fut<Result<UserStatsModel, GetUserStatsError>> {
        Box::pin(async move {
            let stats_table = &self.stats_db.user_stats_table;
            let user = match stats_table.get_user(user_email).await {
                Ok(user) => match user {
                    Some(user) => user,
                    None => {
                        return Err(GetUserStatsError::UserNotFound);
                    }
                },
                Err(e) => {
                    return Err(GetUserStatsError::DatabaseError(e));
                }
            };

            let user_stats = UserStatsModel::from(user);
            Ok(user_stats)
        })
    }
}
