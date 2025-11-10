use std::sync::Arc;

use rocket::{State, post, serde::json::Json};

use crate::{middleware::auth::*, services::{admin::service::AdminService, user_stats::UserStatsService}};

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IsUserAdminRequest {
    pub user_email: String,
}
#[post("/is_user_admin", data = "<request>")]
pub async fn is_user_admin(
    request: Json<IsUserAdminRequest>,
    _user: AuthenticatedAdminUser,
    admin_service: &State<Arc<AdminService>>,
) -> Result<Json<bool>, Json<String>> {
    Ok(Json(admin_service.is_admin(&request.user_email).await))
}

#[post("/is_user_super_admin", data = "<request>")]
pub async fn is_user_super_admin(
    request: Json<IsUserAdminRequest>,
    _user: AuthenticatedAdminUser,
    admin_service: &State<Arc<AdminService>>,
) -> Result<Json<bool>, Json<String>> {
    Ok(Json(
        admin_service.is_super_admin(&request.user_email).await,
    ))
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnregisterUserRequest {
    user_email: String,
}
#[post("/unregister_user", data = "<request>")]
pub async fn unregister_user(
    request: Json<UnregisterUserRequest>,
    admin_service: &State<Arc<AdminService>>,
    user_stats: &State<Arc<UserStatsService>>,
) -> Result<(), String> {
    // Ensure that the user trying to unregister the user is an super adim:
    if admin_service.is_super_admin(&request.user_email).await {
        let user_email = request.user_email.clone(); 
        let user_stats_table = user_stats.stats_db.user_stats_table();
        let user_addins_table = user_stats.stats_db.user_addins_table();

        user_stats_table.delete_user(&user_email).await?;
        user_addins_table.delete_user(&user_email).await?;
    } else {
        return Err("oh your an admin all right, just not a super one".to_string());
    }

    Ok(())
}
