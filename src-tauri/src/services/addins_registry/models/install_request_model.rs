use serde::{Deserialize, Serialize};
use crate::services::addins_registry::models::addin_model::AddinModel;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallAddinRequestModel {
    pub addin:AddinModel,
    pub for_revit_versions:Vec<String>,
}