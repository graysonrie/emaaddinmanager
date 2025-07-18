use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FrontendKvSubscriptionModel {
    pub identifier: String,
    pub last_data: Option<serde_json::Value>,
}
