use std::sync::Arc;

use tauri::State;

use crate::services::local_db::service::LocalDbService;

#[tauri::command]
pub async fn sign_in_with_microsoft(
    local_db: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    super::sign_in_with_microsoft(local_db).await
}

#[tauri::command]
pub async fn sign_out(local_db: State<'_, Arc<LocalDbService>>) -> Result<(), String> {
    super::sign_out(local_db).await
}
