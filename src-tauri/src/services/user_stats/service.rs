use std::sync::Arc;

use crate::services::{local_addins::service::LocalAddinsService, user_stats::*};
use crate::{
    constants::Fut,
    services::{addins_registry::services::AddinsRegistry, local_db::service::LocalDbService},
};

type AddinsRegistryService = Arc<dyn AddinsRegistry + Send + Sync + 'static>;

pub struct UserStatsService {
    local_stats: Option<LocalUserStatsService>,
}

impl UserStatsService {
    pub fn new_local(db: Arc<LocalDbService>, addins_registry: AddinsRegistryService) -> Self {
        Self {
            db,
            addins_registry,
        }
    }
}

impl UserStats for UserStatsService {
    fn get_user_stats(&self) -> Fut<Result<UserStatsModel, GetUserStatsError>> {
        Box::pin(async move {
            let local_addins = LocalAddinsService::get_local_addins()
                .map_err(GetUserStatsError::LocalAddinsError)?;

            todo!()
        })
    }
}
