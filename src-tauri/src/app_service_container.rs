use std::sync::Arc;

use tauri::{AppHandle, Manager};

use crate::services::{
    addins_registry::service::{AddinsRegistryService, RegistryLocation},
    app_save::service::{AppSavePath, AppSaveService},
    local_db::service::LocalDbService,
};

pub fn initialize_app(handle: &AppHandle) {
    let handle = handle.clone();
    tauri::async_runtime::spawn(async move {
        let app_save_service = initialize_app_save_service(AppSavePath::AppData);
        let local_db_service = initialize_local_db_service(&app_save_service, handle.clone()).await;

        let registry_location = RegistryLocation::Local("C:\\Users\\grays\\OneDrive\\Desktop\\TestRegistryLocation".to_string());
        let addins_registry_service = initialize_addins_registry_service(registry_location);

        handle.manage(Arc::clone(&local_db_service));
        handle.manage(Arc::clone(&app_save_service));
        handle.manage(Arc::clone(&addins_registry_service));
    });
}

fn initialize_app_save_service(save_dir: AppSavePath) -> Arc<AppSaveService> {
    Arc::new(AppSaveService::new(save_dir))
}

fn initialize_addins_registry_service(registry_location: RegistryLocation) -> Arc<AddinsRegistryService> {
    Arc::new(AddinsRegistryService::new(registry_location))
}

async fn initialize_local_db_service(
    app_save_service: &Arc<AppSaveService>,
    handle: AppHandle,
) -> Arc<LocalDbService> {
    Arc::new(LocalDbService::new_async(app_save_service, handle).await)
}
