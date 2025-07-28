use tauri::{AppHandle, Emitter};

use crate::services::addin_updater::{
    models::UpdateNotificationType,
    update_checker::{
        allowed_addins_manager::{InstallAddinOperation, Operation},
        *,
    },
};

pub fn with(app: &AppHandle) -> Notifier {
    Notifier { app: app.clone() }
}

pub struct Notifier {
    app: AppHandle,
}

impl Notifier {
    pub fn emit_update(&self, notifications: &[UpdateNotificationModel]) {
        if let Err(e) = self.app.emit("addin_updates_available", notifications) {
            eprintln!("Failed to emit addin updates event: {}", e);
        }
    }

    pub fn emit_no_updates(&self) {
        let no_updates_notification = vec![UpdateNotificationModel {
            title: "No updates available".to_string(),
            description: "All addins are up to date".to_string(),
            notification_type: UpdateNotificationType::Info,
        }];
        if let Err(e) = self
            .app
            .emit("addin_updates_available", &no_updates_notification)
        {
            eprintln!("Failed to emit no updates notification: {}", e);
        }
    }



    pub fn install_addin_pending(&self, install_operations: &[InstallAddinOperation]) {
        let mut notifications = Vec::new();

        for operation in install_operations {
            let notification = match operation.operation {
                Operation::Install => UpdateNotificationModel {
                    title: format!("{} is ready to be installed", operation.addin.name),
                    description: "it will be installed once Revit is closed".to_string(),
                    notification_type: UpdateNotificationType::Warning,
                },
                Operation::Uninstall => UpdateNotificationModel {
                    title: format!("{} needs modifications", operation.addin.name),
                    description: "it will be modified once Revit is closed".to_string(),
                    notification_type: UpdateNotificationType::Warning,
                },
            };
            notifications.push(notification);
        }
        self.emit_update(&notifications);
    }

    pub fn allowed_addin_installed(&self, addin: &AddinModel) {
        let notification = UpdateNotificationModel {
            title: format!("{} installed", addin.name),
            description: format!("{} is now available in the addin menu", addin.name),
            notification_type: UpdateNotificationType::Install,
        };
        self.emit_update(&[notification]);
    }
}
