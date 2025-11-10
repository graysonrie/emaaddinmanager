use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddinPackageInfoModel {
    pub package_info_version: String, // Should not be customizable by the user. Only to be set by the program
    pub addin_version: String,
    pub relative_path_to_help_file: Option<String>,
    pub relative_path_to_image: String,
    /// The absolute path that the help file was copied from. Prefer referencing the relative path
    pub absolute_path_to_help_file: Option<String>,
    /// The absolute path that the image was copied from. Prefer referencing the relative path
    pub absolute_path_to_image: String,

    /// The relative path to the addin in the addins registry
    pub relative_path_to_addin: String,
    pub display_name: String,
    /// for example, the addin EMABASES would have 'Bases' for the discipline, but only because it would be the default
    /// addin FOR bases. Even if an addin was related to bases it should not set the discipline package unless it is the default one!
    pub discipline_package: Option<String>,
    pub emoji: Option<String>,
}
