use tauri::AppHandle;

use crate::services::addin_updater::update_checker::*;

pub async fn store_pending_updates(
    update_state: &PendingUpdatesStateType,
    addins_needing_updates: &[AddinNeedingUpdate],
) {
    let pending_updates: Vec<AddinNeedingUpdatePaths> = addins_needing_updates
        .iter()
        .map(|addin_needing_update| AddinNeedingUpdatePaths {
            registry_addin_path: addin_needing_update
                .registry_addin
                .path_to_addin_dll_folder
                .clone(),
            local_addin_path: addin_needing_update
                .local_addin
                .path_to_addin_dll_folder
                .clone(),
        })
        .collect();
    let mut state = update_state.lock().await;
    state.pending_updates = Some(pending_updates);
}

pub async fn clear_pending_updates(update_state: &PendingUpdatesStateType) {
    let mut state = update_state.lock().await;
    state.pending_updates = None;
}

pub async fn try_apply_pending_updates(
    addins_registry: &AsyncAddinsRegistryServiceType,
    update_state: &PendingUpdatesStateType,
    app: &AppHandle,
) -> Result<(), String> {
    let pending_updates = {
        let mut state = update_state.lock().await;
        state.pending_updates.take()
    };
    if let Some(pending_paths) = pending_updates {
        let notifications = apply_pending_updates_by_path(addins_registry, &pending_paths).await?;
        if !notifications.is_empty() {
            notifications::emit_update(app, &notifications);
        }
    }
    Ok(())
}

pub async fn apply_pending_updates_by_path(
    addins_registry: &AsyncAddinsRegistryServiceType,
    pending_paths: &[AddinNeedingUpdatePaths],
) -> Result<Vec<UpdateNotificationModel>, String> {
    let addins = addins_registry
        .get_addins()
        .await
        .map_err(|e| format!("Registry error: {}", e))?;
    let current_local_addins =
        LocalAddinsService::get_local_addins().map_err(|e| format!("Local addins error: {}", e))?;
    let mut update_notifications = Vec::new();
    for addin_needing_update_paths in pending_paths {
        let registry_path = &addin_needing_update_paths.registry_addin_path;
        let local_path = &addin_needing_update_paths.local_addin_path;
        if let Some(registry_addin) = addins
            .iter()
            .find(|a| a.path_to_addin_dll_folder == *registry_path)
        {
            if let Some(local_addin) = current_local_addins
                .iter()
                .find(|a| a.path_to_addin_dll_folder == *local_path)
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
}
