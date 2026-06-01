use std::sync::Arc;

use tauri::State;

use crate::services::{
    admin::{
        addin_permissions::{models::user::UserModel, service::AddinPermissionsService},
        service::AdminService,
    },
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
pub async fn set_allowed_addin_paths(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
    addin_paths: Vec<String>,
) -> Result<(), String> {
    addin_permissions_service
        .set_allowed_addin_paths(user_email, addin_paths)
        .await
}

#[tauri::command]
pub async fn set_blocked_addin_paths(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    user_email: String,
    addin_paths: Vec<String>,
) -> Result<(), String> {
    addin_permissions_service
        .set_blocked_addin_paths(user_email, addin_paths)
        .await
}

#[tauri::command]
pub async fn block_addin_path_for_all_users(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    admin_service: State<'_, Arc<AdminService>>,
    addin_path: String,
) -> Result<(), String> {
    // Admins are never blocked.
    let exclude_emails = admin_service.all_admin_emails();
    addin_permissions_service
        .block_addin_path_for_all_users(addin_path, exclude_emails)
        .await
}

#[tauri::command]
pub async fn unblock_addin_path_for_all_users(
    addin_permissions_service: State<'_, Arc<AddinPermissionsService>>,
    addin_path: String,
) -> Result<(), String> {
    addin_permissions_service
        .unblock_addin_path_for_all_users(addin_path)
        .await
}
