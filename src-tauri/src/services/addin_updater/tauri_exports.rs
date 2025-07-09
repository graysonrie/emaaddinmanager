use std::sync::Arc;

use crate::services::{
    addin_updater::{models::UpdateNotificationModel, service::AddinUpdaterService},
    config::keys,
    local_db::service::LocalDbService,
};

#[tauri::command]
pub async fn check_for_updates(
    addin_updater_service: tauri::State<'_, Arc<AddinUpdaterService>>,
    local_db: tauri::State<'_, Arc<LocalDbService>>,
) -> Result<Vec<UpdateNotificationModel>, String> {
    // Ensure that the user is logged in
    let user_email = keys::get_user_email(local_db.inner().clone()).await?;
    if user_email.is_empty() {
        return Err("User email not found".to_string());
    }

    addin_updater_service
        .check_for_updates()
        .await
        .map_err(|e| e.to_string())
}
