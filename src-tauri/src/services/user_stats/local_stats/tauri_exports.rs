use std::sync::Arc;

use tauri::State;

use crate::services::{
    config::keys,
    local_db::service::LocalDbService,
    user_stats::{models::UserStatsModel, *},
};

/// Creates a new user with the given email and name
/// If the user already exists, this function will return an error
///
/// Returns the user stats of the created user
#[tauri::command]
pub async fn create_user_stats(
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
    local_db_service: State<'_, Arc<LocalDbService>>,
) -> Result<UserStatsModel, String> {
    let user_email = keys::get_user_email(local_db_service.inner().clone()).await?;
    let user_name = keys::get_user_name(local_db_service.inner().clone()).await?;
    let user_stats_table = user_stats_service.stats_db.user_stats_table();
    let user_stats = user_stats_table
        .create_user(user_email, user_name)
        .await
        .map_err(|e| e.to_string())?;
    let user_stats = UserStatsModel::from(user_stats);
    Ok(user_stats)
}

#[tauri::command]
pub async fn does_user_exist(
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
    user_email: String,
) -> Result<bool, String> {
    user_stats_service.does_user_exist(user_email).await
}

#[tauri::command]
pub async fn update_user_stats(
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
) -> Result<Option<UserStatsModel>, String> {
    user_stats_service.refresh_user_stats().await
}

/// Returns the stats of every user.
///
/// Updates the stats of the user that is currently using the app
#[tauri::command]
pub async fn get_all_user_stats(
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
) -> Result<Vec<UserStatsModel>, String> {
    // Refresh this user's stats:
    user_stats_service.refresh_user_stats().await?;

    user_stats_service.get_all_user_stats().await
}

/// Changes the email of the user with the given email
/// If the user does not exist, this function will return an error
///
/// Updates the email in the user stats table and the user addins table
///
/// TODO: Consider a unified API for this
#[tauri::command]
pub async fn change_user_stats_email(
    new_user_email: String,
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
    local_db_service: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    let user_email = keys::get_user_email(local_db_service.inner().clone()).await?;
    let user_stats_table = user_stats_service.stats_db.user_stats_table();
    let user_addins_table = user_stats_service.stats_db.user_addins_table();
    user_stats_table
        .change_email(user_email.clone(), new_user_email.clone())
        .await
        .map_err(|e| e.to_string())?;
    // Also change the email in the user addins table:
    user_addins_table
        .change_email(user_email, new_user_email)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn change_user_stats_name(
    new_user_name: String,
    user_stats_service: State<'_, Arc<LocalUserStatsService>>,
    local_db_service: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    let user_email = keys::get_user_email(local_db_service.inner().clone()).await?;
    let user_stats_table = user_stats_service.stats_db.user_stats_table();
    user_stats_table
        .change_name(user_email, new_user_name)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
