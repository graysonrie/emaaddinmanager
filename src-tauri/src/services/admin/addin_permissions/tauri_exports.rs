use std::sync::Arc;

use tauri::State;

use crate::services::admin::addin_permissions::{
    models::user::UserModel, service::AddinPermissionsService,
};

#[tauri::command]
pub async fn register_user(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
    user_discipline: String,
) -> Result<UserModel, String> {
    addin_permissions_service
        .register_user(user_email, user_discipline)
        .await
}

#[tauri::command]
pub async fn get_user(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
) -> Result<Option<UserModel>, String> {
    addin_permissions_service.get_user(user_email).await
}

#[tauri::command]
pub async fn add_allowed_addin_paths(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
    addin_paths: Vec<String>,
) -> Result<(), String> {
    addin_permissions_service
        .add_allowed_addin_paths(user_email, addin_paths)
        .await
}

#[tauri::command]
pub async fn remove_allowed_addin_paths(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
    addin_paths: Vec<String>,
) -> Result<(), String> {
    addin_permissions_service
        .remove_allowed_addin_paths(user_email, addin_paths)
        .await
}
