use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotificationModel {
    pub addin_name: String,
    pub addin_vendor_id: String,
    pub addin_vendor_email: String,
}
