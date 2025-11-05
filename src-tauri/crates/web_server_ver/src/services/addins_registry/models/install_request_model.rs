use crate::services::addins_registry::models::addin_model::AddinModel;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallAddinRequestModel {
    pub addin: AddinModel,
    pub for_revit_versions: Vec<String>,
}
