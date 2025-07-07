use std::sync::Arc;

use tauri::{AppHandle, Manager};

use crate::services::{
    addins_registry::service::AddinsRegistryService, app_save::service::{AppSavePath, AppSaveService}, local_addins::service::LocalAddinsService, local_db::service::LocalDbService, user_stats::UserStatsService
};

pub fn initialize_app(handle: &AppHandle) {
    let handle = handle.clone();
    tauri::async_runtime::spawn(async move {
        let app_save_service = initialize_app_save_service(AppSavePath::AppData);
        let local_db_service = initialize_local_db_service(&app_save_service, handle.clone()).await;

        let addins_registry_service =
            initialize_addins_registry_service_local(Arc::clone(&local_db_service));
        let user_stats_service = initialize_user_stats_service(
            Arc::clone(&local_db_service),
            Arc::clone(&addins_registry_service),
        );

        handle.manage(Arc::clone(&local_db_service));
        handle.manage(Arc::clone(&app_save_service));
        handle.manage(Arc::clone(&addins_registry_service));
        handle.manage(Arc::clone(&user_stats_service));
    });
}

fn initialize_app_save_service(save_dir: AppSavePath) -> Arc<AppSaveService> {
    Arc::new(AppSaveService::new(save_dir))
}

fn initialize_addins_registry_service_local(db: Arc<LocalDbService>) -> Arc<AddinsRegistryService> {
    Arc::new(AddinsRegistryService::new_local(db))
}

async fn initialize_local_db_service(
    app_save_service: &Arc<AppSaveService>,
    handle: AppHandle,
) -> Arc<LocalDbService> {
    Arc::new(LocalDbService::new_async(app_save_service, handle).await)
}

fn initialize_user_stats_service(
    db: Arc<LocalDbService>,
    addins_registry: Arc<AddinsRegistryService>,
) -> Arc<UserStatsService> {
    Arc::new(UserStatsService::new(db, addins_registry))
}
