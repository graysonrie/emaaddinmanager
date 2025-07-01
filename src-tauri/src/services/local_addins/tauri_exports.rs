use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::local_addins::service::LocalAddinsService;

#[tauri::command]
pub fn get_local_addins() -> Result<Vec<AddinModel>, String> {
    LocalAddinsService::get_local_addins()
}

#[tauri::command]
pub fn get_revit_versions() -> Result<Vec<String>, String> {
    LocalAddinsService::get_revit_versions()
}

#[tauri::command]
pub fn install_addin(addin: AddinModel, for_revit_versions: Vec<String>) -> Result<(), String> {
    LocalAddinsService::install_addin(&addin, &for_revit_versions).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn uninstall_addin(addin: AddinModel, for_revit_versions: Vec<String>) -> Result<(), String> {
    LocalAddinsService::uninstall_addin(&addin, &for_revit_versions).map_err(|e| e.to_string())
}