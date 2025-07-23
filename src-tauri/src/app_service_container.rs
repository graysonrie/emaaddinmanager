use std::{path::Path, sync::Arc};

use tauri::{AppHandle, Manager};

use crate::services::{
    addin_updater::service::AddinUpdaterService,
    addins_registry::services::local_registry::LocalAddinsRegistryService,
    admin::{addin_permissions::service::AddinPermissionsService, service::AdminService},
    app_save::service::{AppSavePath, AppSaveService},
    local_db::service::LocalDbService,
    user_stats::LocalUserStatsService,
};

pub fn initialize_app(handle: &AppHandle) {
    let handle = handle.clone();
    tauri::async_runtime::spawn(async move {
        let app_save_service = initialize_app_save_service(AppSavePath::AppData);
        let local_db_service = initialize_local_db_service(&app_save_service, handle.clone()).await;

        let stats_db_dir =
            Path::new("C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry");

        let addins_registry_service =
            initialize_addins_registry_service_local(Arc::clone(&local_db_service));
        let user_stats_service = initialize_user_stats_service_local(
            Arc::clone(&local_db_service),
            Arc::clone(&addins_registry_service),
            stats_db_dir,
        )
        .await;
        let addin_updater_service =
            initialize_addin_updater_service(Arc::clone(&addins_registry_service), handle.clone(), Arc::clone(&user_stats_service), Arc::clone(&local_db_service) );
        let addin_permissions_service =
            initialize_addins_permissions_service(Arc::clone(&user_stats_service)).await;
        let admin_service = initialize_admin_service(Arc::clone(&local_db_service)).await;

        handle.manage(Arc::clone(&local_db_service));
        handle.manage(Arc::clone(&app_save_service));
        handle.manage(Arc::clone(&addins_registry_service));
        handle.manage(Arc::clone(&user_stats_service));
        handle.manage(Arc::clone(&addin_updater_service));
        handle.manage(Arc::clone(&addin_permissions_service));
        handle.manage(Arc::clone(&admin_service));
    });
}

fn initialize_app_save_service(save_dir: AppSavePath) -> Arc<AppSaveService> {
    Arc::new(AppSaveService::new(save_dir))
}

fn initialize_addins_registry_service_local(
    db: Arc<LocalDbService>,
) -> Arc<LocalAddinsRegistryService> {
    Arc::new(LocalAddinsRegistryService::new(db))
}

fn initialize_addin_updater_service(
    addins_registry: Arc<LocalAddinsRegistryService>,
    app_handle: AppHandle,
    user_stats: Arc<LocalUserStatsService>,
    db: Arc<LocalDbService>,
) -> Arc<AddinUpdaterService> {
    Arc::new(AddinUpdaterService::new(addins_registry, app_handle, user_stats, db))
}

async fn initialize_local_db_service(
    app_save_service: &Arc<AppSaveService>,
    handle: AppHandle,
) -> Arc<LocalDbService> {
    Arc::new(LocalDbService::new_async(app_save_service, handle).await)
}

async fn initialize_user_stats_service_local(
    db: Arc<LocalDbService>,
    addins_registry: Arc<LocalAddinsRegistryService>,
    path_to_stats_db: &Path,
) -> Arc<LocalUserStatsService> {
    Arc::new(LocalUserStatsService::new_async(db, addins_registry, path_to_stats_db).await)
}

async fn initialize_addins_permissions_service(
    user_stats: Arc<LocalUserStatsService>,
) -> Arc<AddinPermissionsService> {
    Arc::new(AddinPermissionsService::new(user_stats))
}

async fn initialize_admin_service(local_db: Arc<LocalDbService>) -> Arc<AdminService> {
    Arc::new(AdminService::new(local_db))
}
