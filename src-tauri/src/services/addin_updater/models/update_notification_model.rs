use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UpdateNotificationType {
    Info,
    Install,
    Warning
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotificationModel {
    pub title: String,
    pub description: String,
    pub notification_type: UpdateNotificationType,
}
