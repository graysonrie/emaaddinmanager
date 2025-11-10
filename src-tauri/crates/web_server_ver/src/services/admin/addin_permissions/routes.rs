use std::sync::Arc;

use rocket::{State, http::Status, post, response::status, serde::json::Json};

use crate::{
    middleware::auth::*,
    services::{
        admin::addin_permissions::{models::user::UserModel, service::AddinPermissionsService},
        user_stats::UserStatsService,
    },
};

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterUserRequest {
    pub user_name: String,
    pub user_discipline: String,
}
#[post("/register_user", data = "<request>")]
pub async fn register_user(
    request: Json<RegisterUserRequest>,
    _user: AuthenticatedUser,
    addin_permissions_service: &State<Arc<AddinPermissionsService>>,
    user_stats: &State<Arc<UserStatsService>>,
) -> Result<Json<UserModel>, Json<String>> {
    let user_name = &request.user_name;
    let user_email = _user.data.email;
    let user_discipline = &request.user_discipline;

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
            .register_user(user_email.clone(), user_discipline.clone())
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
                .create_user(user_email, user_name.to_string())
                .await
                .map_err(|e| format!("Failed to create user in stats table: {}", e))?;
        }
        Err(e) => {
            // Error checking user stats table
            return Err(Json(format!("Failed to check user stats table: {}", e)));
        }
    }

    Ok(Json(user_model))
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetUserRequest {
    pub user_email: String,
}
#[post("/get_user", data = "<request>")]
pub async fn get_user(
    request: Json<GetUserRequest>,
    _user: AuthenticatedUser,
    addin_permissions_service: &State<Arc<AddinPermissionsService>>,
) -> Result<Json<Option<UserModel>>, status::Custom<Json<String>>> {
    // If the user is trying to get themself, thats allowed, otherwise, they must be an admin:
    let tgt_email = request.user_email.clone();

    if _user.data.email != tgt_email && !_user.is_admin_type() {
        return Err(status::Custom(
            Status::Unauthorized,
            Json("Cannot get other user".to_string()),
        ));
    }

    addin_permissions_service
        .get_user(tgt_email)
        .await
        .map(Json)
        .map_err(|err| status::Custom(Status::BadRequest, Json(err)))
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetAllowedAddinPathsRequest {
    pub user_email: String,
    pub addin_paths: Vec<String>,
}
#[post("/set_allowed_addin_paths", data = "<request>")]
pub async fn set_allowed_addin_paths(
    request: Json<SetAllowedAddinPathsRequest>,
    addin_permissions_service: &State<Arc<AddinPermissionsService>>,
    _user: AuthenticatedAdminUser,
) -> Result<(), String> {
    let user_email = request.user_email.clone();
    let addin_paths = request.addin_paths.clone();
    addin_permissions_service
        .set_allowed_addin_paths(user_email, addin_paths)
        .await
}
