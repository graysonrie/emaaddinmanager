use std::sync::Arc;
use tauri::{AppHandle, State};

use crate::services::addin_updater::{
    service::AddinUpdaterService,
    update_checker::{manual_check_for_updates, PendingUpdatesStateType},
};

/// Manually trigger a check for addin updates
#[tauri::command]
pub async fn check_for_updates_manual(
    app: AppHandle,
    addin_updater_service: State<'_, Arc<AddinUpdaterService>>,
    pending_updates_state: State<'_, PendingUpdatesStateType>,
) -> Result<bool, String> {
    // Get the addins registry from the service
    let addins_registry = &addin_updater_service.addins_registry;

    // Perform the manual check
    match manual_check_for_updates(addins_registry, &pending_updates_state, &app).await {
        Ok(_notifications) => {
            // The manual check will emit notification events to the frontend
            Ok(!_notifications.is_empty())
        }
        Err(e) => {
            eprintln!("Manual update check failed: {}", e);
            Err(e)
        }
    }
}

/// Check if Revit is currently running
#[tauri::command]
pub async fn is_revit_running() -> Result<bool, String> {
    revit_check::is_revit_running()
        .await
        .map_err(|e| e.to_string())
}

/// Get information about pending addin updates
#[tauri::command]
pub async fn get_pending_updates_info(
    pending_updates_state: State<'_, PendingUpdatesStateType>,
) -> Result<Option<String>, String> {
    let state = pending_updates_state.lock().await;
    if let Some(pending_updates) = &state.pending_updates {
        let update_count = pending_updates.len();
        return Ok(Some(format!(
            "{} addin update{} pending",
            update_count,
            if update_count == 1 { "" } else { "s" }
        )));
    }
    Ok(None)
}
