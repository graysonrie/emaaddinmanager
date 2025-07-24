use std::sync::Arc;
use tauri::State;

use crate::services::addin_updater::{
    service::AddinUpdaterService,
    update_checker::{PendingUpdatesStateType, UpdateResult},
};

/// Manually trigger a check for addin updates
#[tauri::command]
pub async fn check_for_updates_manual(
    addin_updater_service: State<'_, Arc<AddinUpdaterService>>,
) -> Result<bool, String> {
    // Perform the manual check
    match addin_updater_service.manually_check_for_updates().await {
        Ok(result) => {
            // The manual check will emit notification events to the frontend
            match result {
                UpdateResult::Updated => Ok(true),
                _ => Ok(false),
            }
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
