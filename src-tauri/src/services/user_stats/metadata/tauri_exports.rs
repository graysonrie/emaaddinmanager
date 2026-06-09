use std::sync::Arc;

use tauri::{AppHandle, State};

use crate::services::user_stats::{
    db::user_metadata::models::UserMetadataModel, metadata::service::UserMetadataService,
};

/// Updates the version metadata for the user to the current version of the app
#[tauri::command]
pub async fn update_user_app_version_metadata(
    app: AppHandle,
    metadata_service: State<'_, Arc<UserMetadataService>>,
) -> Result<(), String> {
    let version = app.package_info().version.to_string();
    metadata_service.set_version_metadata(version).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_user_metadata(
    metadata_service: State<'_, Arc<UserMetadataService>>,
    user_email: String,
) -> Result<UserMetadataModel, String> {
    metadata_service.get_user_metadata(user_email).await
}

#[tauri::command]
pub async fn get_user_metadata_many(
    metadata_service: State<'_, Arc<UserMetadataService>>,
    user_emails: Vec<String>,
) -> Result<Vec<UserMetadataModel>, String> {
    metadata_service.get_user_metadata_many(user_emails).await
}
