use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimplifiedAddinInfoModel {
    pub name: String,
    pub email: String,
    pub vendor_id: String,
    pub description: String,
}
