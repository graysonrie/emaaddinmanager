use tauri::{AppHandle, Emitter};

use crate::services::addin_updater::{models::UpdateNotificationType, update_checker::*};

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

    pub fn update_addin_pending(&self, addins: &[AddinNeedingUpdate]) {
        let mut notifications = Vec::new();
        for addin in addins {
            let notification = UpdateNotificationModel {
                title: format!("{} is ready to be updated", addin.registry_addin.name),
                description: "it will be updated once Revit is closed".to_string(),
                notification_type: UpdateNotificationType::Warning,
            };
            notifications.push(notification);
        }
        self.emit_update(&notifications);
    }
}
