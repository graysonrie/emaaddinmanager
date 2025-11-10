use serde::{Deserialize, Serialize};

/// A model for an addin to install or uninstall
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddinToInstallModel {
    pub addin_relative_registry_path: String,
    pub for_versions: Vec<String>,
}
