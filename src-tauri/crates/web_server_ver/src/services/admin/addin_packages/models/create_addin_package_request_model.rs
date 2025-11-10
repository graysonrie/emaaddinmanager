use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateAddinPackageRequestModel {
    pub addin_version: String,
    /// The absolute path to the help file that will be copied over
    pub path_to_help_file: Option<String>,
    /// The absolute path to the image file that will be copied over
    pub path_to_image_file: String,
    pub display_name: String,
    /// for example, the addin EMABASES would have 'Bases' for the discipline, but only because it would be the default
    /// addin FOR bases. Even if an addin was related to bases it should not set the discipline package unless it is the default one!
    pub discipline_package: Option<String>,
    /// Should only be set if the addin is connected to a discipline
    pub emoji: Option<String>,
}
