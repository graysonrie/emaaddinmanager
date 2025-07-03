use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::local_addins::models::uninstall_request_model::UninstallAddinRequestModel;
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
pub fn uninstall_addins(uninstall_requests: Vec<UninstallAddinRequestModel>) -> Result<(), String> {
    for uninstall_request in uninstall_requests {
        LocalAddinsService::uninstall_addin(
            &uninstall_request.addin,
            &uninstall_request.for_revit_versions,
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}
