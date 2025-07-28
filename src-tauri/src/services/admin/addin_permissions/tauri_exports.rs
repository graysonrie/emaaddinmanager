use std::sync::Arc;

use tauri::State;

use crate::services::{
    admin::addin_permissions::{models::user::UserModel, service::AddinPermissionsService},
    user_stats::LocalUserStatsService,
};

#[tauri::command]
pub async fn register_user(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_stats: State<'_, Arc<LocalUserStatsService>>,
    user_email: String,
    user_name: String,
    user_discipline: String,
) -> Result<UserModel, String> {
    // Check if user already exists in addin permissions
    let existing_user = addin_permissions_service
        .get_user(user_email.clone())
        .await?;

    let user_model = if let Some(user) = existing_user {
        // User already exists in addin permissions, return existing user
        user
    } else {
        // User doesn't exist, create new user in addin permissions
        addin_permissions_service
            .register_user(user_email.clone(), user_discipline)
            .await?
    };

    // Check if user exists in user stats table
    let user_stats_table = user_stats.stats_db.user_stats_table();
    let existing_user_stats = user_stats_table.get_user(user_email.clone()).await;

    match existing_user_stats {
        Ok(Some(_)) => {
            // User already exists in user stats table
            println!("User {} already exists in user stats table", user_email);
        }
        Ok(None) => {
            // User doesn't exist in user stats table, create them
            user_stats_table
                .create_user(user_email, user_name)
                .await
                .map_err(|e| format!("Failed to create user in stats table: {}", e))?;
        }
        Err(e) => {
            // Error checking user stats table
            return Err(format!("Failed to check user stats table: {}", e));
        }
    }

    Ok(user_model)
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
