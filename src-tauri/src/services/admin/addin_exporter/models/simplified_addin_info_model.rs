use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SimplifiedAddinInfoModel {
    pub name: String,
    pub email: String,
    pub vendor_id: String,
    pub description: String,
    pub csharp_project_name: String,
    pub addin_version: String,

    pub reason_for_export: Option<String>,
}
