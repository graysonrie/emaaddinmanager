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
