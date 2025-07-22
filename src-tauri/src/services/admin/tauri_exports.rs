use std::sync::Arc;

use crate::services::admin::service::AdminService;

#[tauri::command]
pub async fn is_user_admin(
    admin_service: tauri::State<'_, Arc<AdminService>>,
) -> Result<bool, String> {
    Ok(admin_service.is_admin().await)
}
