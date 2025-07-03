use std::sync::Arc;

use crate::services::{
    addin_exporter::models::category_model::CategoryModel,
    addins_registry::{
        models::{addin_model::AddinModel, install_request_model::InstallAddinRequestModel},
        service::AddinsRegistryService,
    },
};
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub async fn get_addins(
    addins_registry_service: State<'_, Arc<AddinsRegistryService>>,
    path: String,
) -> Result<Vec<AddinModel>, String> {
    Ok(addins_registry_service.get_addins(&path))
}

/// Installs a list of addins, emitting an the addin's ID for each addin that is installed
#[tauri::command]
pub async fn install_addins(
    app: AppHandle,
    addins_registry_service: State<'_, Arc<AddinsRegistryService>>,
    install_requests: Vec<InstallAddinRequestModel>,
) -> Result<(), String> {
    for install_request in install_requests {
        let addin = install_request.addin;
        let for_revit_versions = install_request.for_revit_versions;
        let addin_id = addin.addin_id.clone();
        addins_registry_service
            .install_addin(addin, for_revit_versions)
            .map_err(|e| e.to_string())?;
        app.emit("addin_installed", addin_id)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn delist_addin(
    addins_registry_service: State<'_, Arc<AddinsRegistryService>>,
    addin: AddinModel,
    registry_path: String,
) -> Result<(), String> {
    addins_registry_service.delist_addin(addin, &registry_path)
}

#[tauri::command]
pub async fn get_categories(path: String) -> Result<Vec<CategoryModel>, String> {
    AddinsRegistryService::get_categories_locally(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_category_to_registry(
    full_category_path: String,
    registry_path: String,
) -> Result<(), String> {
    AddinsRegistryService::add_category_to_registry(&full_category_path, &registry_path)
}
