use crate::services::addins_registry::{models::addin_model::AddinModel, service::AddinsRegistryService};
use tauri::State;

#[tauri::command]
pub fn get_addins(addins_registry_service: State<'_, AddinsRegistryService>) -> Vec<AddinModel> {
    addins_registry_service.get_addins()
}