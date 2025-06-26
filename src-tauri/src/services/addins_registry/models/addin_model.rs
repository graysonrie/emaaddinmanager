#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddinModel {
    /// Full path to the .addin file
    pub path_to_addin_xml_file: String,
    /// Full path to the file with the DLLs for the addin
    pub path_to_addin_dll_folder: String,
    /// The name of the addin
    pub name: String,
    /// The version of the addin
    pub version: String,
    /// The vendor of the addin
    pub vendor: String,
    /// The email of the vendor
    pub email: String,
    /// The type of the addin. Application, Command, etc.
    pub addin_type: String,
}

impl AddinModel {
    /// Create a new AddinModel from XML data and file paths
    pub fn from_xml_data(
        xml_file_path: String,
        dll_folder_path: String,
        xml_addin: &crate::services::addins_registry::models::addin_xml_model::AddIn,
    ) -> Self {
        Self {
            path_to_addin_xml_file: xml_file_path,
            path_to_addin_dll_folder: dll_folder_path,
            name: xml_addin.name.clone(),
            version: "1.0.0".to_string(), // Default version, could be extracted from XML if available
            vendor: xml_addin.vendor_id.clone(),
            email: xml_addin.vendor_email.clone(),
            addin_type: xml_addin.addin_type.clone(),
        }
    }
}
