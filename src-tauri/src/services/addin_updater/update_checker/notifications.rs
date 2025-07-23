use tauri::{AppHandle, Emitter};

use crate::services::addin_updater::update_checker::{
    allowed_addins_manager::{InstallAddinOperation, Operation},
    *,
};

pub fn emit_update(app: &AppHandle, notifications: &[UpdateNotificationModel]) {
    if let Err(e) = app.emit("addin_updates_available", notifications) {
        eprintln!("Failed to emit addin updates event: {}", e);
    }
}

pub fn emit_no_updates(app: &AppHandle) {
    let no_updates_notification = vec![UpdateNotificationModel {
        title: "No updates available".to_string(),
        description: "All addins are up to date".to_string(),
    }];
    if let Err(e) = app.emit("addin_updates_available", &no_updates_notification) {
        eprintln!("Failed to emit no updates notification: {}", e);
    }
}

pub fn pending_update(addins_needing_updates: &[AddinNeedingUpdate]) -> UpdateNotificationModel {
    let update_count = addins_needing_updates.len();
    let addin_names: Vec<String> = addins_needing_updates
        .iter()
        .map(|addin_needing_update| addin_needing_update.local_addin.name.clone())
        .collect();
    UpdateNotificationModel {
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
    }
}

pub fn install_addin_pending(
    install_operations: &[InstallAddinOperation],
) -> Vec<UpdateNotificationModel> {
    let mut notifications = Vec::new();

    for operation in install_operations {
        let notification = match operation.operation {
            Operation::Install => UpdateNotificationModel {
                title: format!("{} is ready to be installed", operation.addin.name),
                description: "it will be installed once Revit is closed".to_string(),
            },
            Operation::Uninstall => UpdateNotificationModel {
                title: format!("{} needs modifications", operation.addin.name),
                description: "it will be modified once Revit is closed".to_string(),
            },
        };
        notifications.push(notification);
    }

    notifications
}

pub fn allowed_addin_installed(app: &AppHandle, addin: &AddinModel) {
    let notification = UpdateNotificationModel {
        title: format!("{} installed", addin.name),
        description: format!("{} is now available in the addin menu", addin.name),
    };
    emit_update(app, &[notification]);
}
