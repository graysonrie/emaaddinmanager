use std::sync::Arc;

use tauri::State;

use crate::services::{admin::service::AdminService, user_stats::LocalUserStatsService};

#[tauri::command]
pub async fn is_user_admin(
    admin_service: tauri::State<'_, Arc<AdminService>>,
) -> Result<bool, String> {
    Ok(admin_service.is_admin().await)
}

#[tauri::command]
pub async fn is_user_super_admin(
    admin_service: tauri::State<'_, Arc<AdminService>>,
) -> Result<bool, String> {
    Ok(admin_service.is_super_admin().await)
}

#[tauri::command]
pub async fn is_other_user_admin(
    user_email: String,
    admin_service: tauri::State<'_, Arc<AdminService>>,
) -> Result<bool, String> {
    Ok(admin_service.is_other_admin(&user_email))
}

#[tauri::command]
pub async fn is_other_user_super_admin(
    user_email: String,
    admin_service: tauri::State<'_, Arc<AdminService>>,
) -> Result<bool, String> {
    Ok(admin_service.is_other_super_admin(&user_email))
}

/// Remove the user from the stats db so that they do not appear at all on the stats page
#[tauri::command]
pub async fn unregister_user(
    user_email: String,
    admin_service: State<'_, Arc<AdminService>>,
    user_stats: State<'_, Arc<LocalUserStatsService>>,
) -> Result<(), String> {
    // Ensure that the user trying to unregister the user is an super adim:
    if admin_service.is_super_admin().await {
        let user_stats_table = user_stats.stats_db.user_stats_table();
        let user_addins_table = user_stats.stats_db.user_addins_table();

        user_stats_table.delete_user(&user_email).await?;
        user_addins_table.delete_user(&user_email).await?;
    } else {
        return Err("oh your an admin all right, just not a super one".to_string());
    }

    Ok(())
}
