use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tokio::time::sleep;

use crate::services::{
    addin_updater::{helpers, models::UpdateNotificationModel},
    addins_registry::services::AsyncAddinsRegistryServiceType,
    local_addins::service::LocalAddinsService,
};

/// Type alias that is managed by Tauri
pub type PendingUpdatesStateType = Arc<Mutex<PendingUpdatesState>>;
// Thread-safe state for tracking pending updates
#[derive(Default)]
pub struct PendingUpdatesState {
    pub pending_updates: Option<Vec<(String, String)>>, // (registry_addin_path, local_addin_path)
}

pub fn spawn_update_checker(
    app: AppHandle,
    addins_registry: AsyncAddinsRegistryServiceType,
) -> JoinHandle<()> {
    let update_state = Arc::new(Mutex::new(PendingUpdatesState::default()));
    app.manage(update_state.clone());

    tokio::spawn(async move {
        loop {
            // Check for updates
            match check_for_updates(&addins_registry, &update_state).await {
                Ok(notifications) => {
                    if !notifications.is_empty() {
                        println!("Found {} update notification(s)", notifications.len());
                        // Emit the update notifications to the frontend
                        if let Err(e) = app.emit("addin_updates_available", notifications) {
                            eprintln!("Failed to emit addin updates event: {}", e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Error checking for updates: {}", e);
                }
            }

            // Check if we have pending updates and Revit is now closed
            {
                let state = update_state.lock().await;
                if let Some(pending_updates) = &state.pending_updates {
                    if !pending_updates.is_empty() {
                        match revit_check::is_revit_running().await {
                            Ok(false) => {
                                // Revit is now closed, try to apply pending updates
                                drop(state); // Release lock before async call
                                match apply_pending_updates(&addins_registry, &update_state).await {
                                    Ok(notifications) => {
                                        if !notifications.is_empty() {
                                            if let Err(e) =
                                                app.emit("addin_updates_available", notifications)
                                            {
                                                eprintln!(
                                                    "Failed to emit pending updates event: {}",
                                                    e
                                                );
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        eprintln!("Error applying pending updates: {}", e);
                                    }
                                }
                            }
                            Ok(true) => {
                                // Revit is still running, continue waiting
                            }
                            Err(e) => {
                                eprintln!("Error checking Revit status for pending updates: {}", e);
                            }
                        }
                    }
                }
            }

            // Wait for 1 minute before checking again
            sleep(Duration::from_secs(60)).await;
        }
    })
}

async fn check_for_updates(
    addins_registry: &AsyncAddinsRegistryServiceType,
    update_state: &Arc<Mutex<PendingUpdatesState>>,
) -> Result<Vec<UpdateNotificationModel>, String> {
    let addins = addins_registry
        .get_addins()
        .await
        .map_err(|e| format!("Registry error: {}", e))?;

    let current_local_addins =
        LocalAddinsService::get_local_addins().map_err(|e| format!("Local addins error: {}", e))?;

    // First, find all addins that need updates
    let mut addins_needing_updates = Vec::new();

    for current_local_addin in &current_local_addins {
        let current_local_addin_dll_name = helpers::get_addin_dll_folder_name(current_local_addin)
            .map_err(|e| format!("Failed to get local addin DLL folder name: {}", e))?;

        if let Some(corresponding_registry_addin) = addins.iter().find(|addin| {
            let registry_addin_dll_name =
                helpers::get_addin_dll_folder_name(addin).unwrap_or_else(|_| String::new()); // Use empty string if error, will not match
            registry_addin_dll_name == current_local_addin_dll_name
        }) {
            let registry_addin_dll_modification_time = helpers::get_addin_dll_modification_time(
                corresponding_registry_addin,
            )
            .map_err(|e| format!("Failed to get registry addin modification time: {}", e))?;
            let current_local_addin_dll_modification_time =
                helpers::get_addin_dll_modification_time(current_local_addin)
                    .map_err(|e| format!("Failed to get local addin modification time: {}", e))?;

            if registry_addin_dll_modification_time > current_local_addin_dll_modification_time {
                addins_needing_updates.push((corresponding_registry_addin, current_local_addin));
            }
        }
    }

    // If no updates are needed, return empty
    if addins_needing_updates.is_empty() {
        return Ok(vec![]);
    }

    // Check if Revit is running
    let revit_is_running = revit_check::is_revit_running()
        .await
        .map_err(|e| e.to_string())?;

    if revit_is_running {
        // Revit is running, so we can't apply updates yet
        // Store the pending updates for later
        let pending_updates: Vec<(String, String)> = addins_needing_updates
            .iter()
            .map(|(registry_addin, local_addin)| {
                (
                    registry_addin.path_to_addin_dll_folder.clone(),
                    local_addin.path_to_addin_dll_folder.clone(),
                )
            })
            .collect();

        {
            let mut state = update_state.lock().await;
            state.pending_updates = Some(pending_updates);
        }

        let update_count = addins_needing_updates.len();
        let addin_names: Vec<String> = addins_needing_updates
            .iter()
            .map(|(_, local_addin)| local_addin.name.clone())
            .collect();

        return Ok(vec![UpdateNotificationModel {
            title: format!(
                "{} addin update{} available",
                update_count,
                if update_count == 1 { "" } else { "s" }
            ),
            description: format!(
                "{} will be updated once Revit is closed: {}",
                if update_count == 1 {
                    "This addin"
                } else {
                    "These addins"
                },
                addin_names.join(", ")
            ),
        }]);
    }

    // Revit is not running, so we can apply the updates
    let mut update_notifications = Vec::new();

    for (corresponding_registry_addin, current_local_addin) in addins_needing_updates {
        println!("Updating addin: {}", current_local_addin.name);

        match helpers::install_addin(corresponding_registry_addin, current_local_addin) {
            Ok(update_notification) => update_notifications.push(update_notification),
            Err(e) => {
                eprintln!(
                    "Failed to update addin {}: {:?}",
                    current_local_addin.name, e
                );
            }
        }
    }

    // Clear any pending updates since we've applied them
    {
        let mut state = update_state.lock().await;
        state.pending_updates = None;
    }

    Ok(update_notifications)
}

/// Manually trigger a check for updates
pub async fn manual_check_for_updates(
    addins_registry: &AsyncAddinsRegistryServiceType,
    update_state: &Arc<Mutex<PendingUpdatesState>>,
    app: &AppHandle,
) -> Result<Vec<UpdateNotificationModel>, String> {
    println!("Manual update check triggered");
    
    // Check for updates
    match check_for_updates(addins_registry, update_state).await {
        Ok(notifications) => {
            if !notifications.is_empty() {
                println!("Manual check found {} update notification(s)", notifications.len());
                // Emit the update notifications to the frontend
                if let Err(e) = app.emit("addin_updates_available", &notifications) {
                    eprintln!("Failed to emit manual update notifications: {}", e);
                }
            } else {
                println!("Manual check: No updates found");
                // Emit a "no updates" notification
                let no_updates_notification = vec![UpdateNotificationModel {
                    title: "No updates available".to_string(),
                    description: "All addins are up to date".to_string(),
                }];
                if let Err(e) = app.emit("addin_updates_available", &no_updates_notification) {
                    eprintln!("Failed to emit no updates notification: {}", e);
                }
            }
            Ok(notifications)
        }
        Err(e) => {
            eprintln!("Error during manual update check: {}", e);
            Err(e)
        }
    }
}

async fn apply_pending_updates(
    addins_registry: &AsyncAddinsRegistryServiceType,
    update_state: &Arc<Mutex<PendingUpdatesState>>,
) -> Result<Vec<UpdateNotificationModel>, String> {
    let pending_updates = {
        let mut state = update_state.lock().await;
        state.pending_updates.take()
    };

    if let Some(pending_paths) = pending_updates {
        let addins = addins_registry
            .get_addins()
            .await
            .map_err(|e| format!("Registry error: {}", e))?;

        let current_local_addins = LocalAddinsService::get_local_addins()
            .map_err(|e| format!("Local addins error: {}", e))?;

        let mut update_notifications = Vec::new();

        for (registry_path, local_path) in pending_paths {
            // Find the corresponding addin models
            if let Some(registry_addin) = addins
                .iter()
                .find(|a| a.path_to_addin_dll_folder == registry_path)
            {
                if let Some(local_addin) = current_local_addins
                    .iter()
                    .find(|a| a.path_to_addin_dll_folder == local_path)
                {
                    println!("Applying pending update for addin: {}", local_addin.name);

                    match helpers::install_addin(registry_addin, local_addin) {
                        Ok(update_notification) => update_notifications.push(update_notification),
                        Err(e) => {
                            eprintln!(
                                "Failed to apply pending update for addin {}: {:?}",
                                local_addin.name, e
                            );
                        }
                    }
                }
            }
        }

        Ok(update_notifications)
    } else {
        Ok(vec![])
    }
}
