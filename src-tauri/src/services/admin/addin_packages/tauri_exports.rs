use std::sync::Arc;

use tauri::State;

use crate::services::{
    addins_registry::models::addin_model::AddinModel,
    admin::addin_packages::{
        models::{AddinPackageInfoModel, CreateAddinPackageRequestModel},
        service::AddinPackagesService,
    },
};

#[tauri::command]
pub async fn create_package_for_registry_addin(
    addin: AddinModel,
    request: CreateAddinPackageRequestModel,
    service: State<'_, Arc<AddinPackagesService>>,
) -> Result<(), String> {
    service
        .create_package_for_registry_addin(&addin, &request)
        .await
}

#[tauri::command]
pub async fn get_all_addin_packages(
    service: State<'_, Arc<AddinPackagesService>>,
) -> Result<Vec<AddinPackageInfoModel>, String> {
    service.get_all_addin_packages().await
}

#[tauri::command]
pub async fn get_package_info_for_registry_addin(
    addin: AddinModel,
    service: State<'_, Arc<AddinPackagesService>>,
) -> Result<Option<AddinPackageInfoModel>, String> {
    service.get_package_info_for_registry_addin(&addin).await
}

#[tauri::command]
pub async fn check_file_exists(file_path: String) -> Result<bool, String> {
    use std::path::Path;
    Ok(Path::new(&file_path).exists())
}

#[tauri::command]
pub async fn load_image_data_for_package(
    package: AddinPackageInfoModel,
    service: State<'_, Arc<AddinPackagesService>>,
) -> Result<(Vec<u8>, String), String> {
    service.load_image_data_for_package(&package).await
}

#[tauri::command]
pub async fn open_help_file_for_package(
    package: AddinPackageInfoModel,
    service: State<'_, Arc<AddinPackagesService>>,
) -> Result<(), String> {
    service.open_help_file_for_package(&package).await
}
