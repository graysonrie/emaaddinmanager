use std::sync::Arc;

use rocket::{State, post, serde::json::Json};

use crate::{
    middleware::auth::*,
    services::user_stats::{local_stats::models::RefreshUserStatsModel, models::UserStatsModel, *},
};

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserStatsRequestModel {
    pub user_name: String,
}
/// Creates a new user with the given email and name
/// If the user already exists, this function will return an error
///
/// Returns the user stats of the created user
#[post("/create_user_stats", data = "<request>")]
pub async fn create_user_stats(
    request: Json<CreateUserStatsRequestModel>,
    _user: AuthenticatedUser,
    user_stats_service: &State<Arc<UserStatsService>>,
) -> Result<Json<UserStatsModel>, Json<String>> {
    let user_email = _user.data.email.clone();
    let user_name = request.user_name.clone();
    let user_stats_table = user_stats_service.stats_db.user_stats_table();
    let user_stats = user_stats_table
        .create_user(user_email, user_name)
        .await
        .map_err(|e| e.to_string())?;
    let user_stats = UserStatsModel::from(user_stats);

    Ok(Json(user_stats))
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DoesUserExistRequest {
    pub user_email: String,
}
#[post("/create_user_stats", data = "<request>")]
pub async fn does_user_exist(
    request: Json<DoesUserExistRequest>,
    _user: AuthenticatedAdminUser,
    user_stats_service: &State<Arc<UserStatsService>>,
) -> Result<Json<bool>, Json<String>> {
    let user_email = request.user_email.clone();
    user_stats_service
        .does_user_exist(user_email)
        .await
        .map(Json)
        .map_err(Json)
}

#[post("/update_user_stats", data = "<request>")]
pub async fn update_user_stats(
    request: Json<RefreshUserStatsModel>,
    _user: AuthenticatedUser,
    user_stats_service: &State<Arc<UserStatsService>>,
) -> Result<Json<Option<UserStatsModel>>, Json<String>> {
    let user_email = _user.data.email;
    user_stats_service
        .refresh_user_stats(&user_email, request.into_inner())
        .await
        .map(Json)
        .map_err(Json)
}

/// Returns the stats of every user.
///
/// Updates the stats of the user that is currently using the app
#[post("/get_all_user_stats", data = "<request>")]
pub async fn get_all_user_stats(
    request: Json<RefreshUserStatsModel>,
    _user: AuthenticatedUser,
    user_stats_service: &State<Arc<UserStatsService>>,
) -> Result<Json<Vec<UserStatsModel>>, Json<String>> {
    // Refresh this user's stats:
    user_stats_service
        .refresh_user_stats(&_user.data.email, request.into_inner())
        .await?;

    user_stats_service
        .get_all_user_stats()
        .await
        .map(Json)
        .map_err(Json)
}

// ! NOT IMPLEMENTED
// TODO: Consider a unified API for this
// #[tauri::command]
// pub async fn change_user_stats_email(
//     new_user_email: String,
//     user_stats_service: State<'_, Arc<UserStatsService>>,
//     local_db_service: State<'_, Arc<AppDbService>>,
// ) -> Result<(), String> {
//     let user_email = keys::get_user_email(local_db_service.inner().clone()).await?;
//     let user_stats_table = user_stats_service.stats_db.user_stats_table();
//     let user_addins_table = user_stats_service.stats_db.user_addins_table();
//     user_stats_table
//         .change_email(user_email.clone(), new_user_email.clone())
//         .await
//         .map_err(|e| e.to_string())?;
//     // Also change the email in the user addins table:
//     user_addins_table
//         .change_email(user_email, new_user_email)
//         .await
//         .map_err(|e| e.to_string())?;
//     Ok(())
// }

// ! NOT IMPLEMENTED
// #[tauri::command]
// pub async fn change_user_stats_name(
//     new_user_name: String,
//     user_stats_service: State<'_, Arc<UserStatsService>>,
//     local_db_service: State<'_, Arc<AppDbService>>,
// ) -> Result<(), String> {
//     let user_email = keys::get_user_email(local_db_service.inner().clone()).await?;
//     let user_stats_table = user_stats_service.stats_db.user_stats_table();
//     user_stats_table
//         .change_name(user_email, new_user_name)
//         .await
//         .map_err(|e| e.to_string())?;
//     Ok(())
// }
