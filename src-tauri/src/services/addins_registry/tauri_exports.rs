use std::sync::Arc;

use crate::services::addins_registry::{
    models::addin_model::AddinModel, service::AddinsRegistryService,
};
use tauri::State;

#[tauri::command]
pub async fn get_addins(
    addins_registry_service: State<'_, Arc<AddinsRegistryService>>,
    path: String,
) -> Result<Vec<AddinModel>, String> {
    Ok(addins_registry_service.get_addins(&path))
}
