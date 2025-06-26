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
    /// The description of the addin
    pub vendor_description: String,
    /// The Revit version that the addin is installed in. Will only be present if the addin is installed locally
    pub revit_version: Option<String>,
}

impl AddinModel {
    fn from_xml_common(
        xml_file_path: String,
        dll_folder_path: String,
        xml_addin: &crate::services::addins_registry::models::addin_xml_model::AddIn,
        revit_version: Option<String>,
    ) -> Self {
        Self {
            path_to_addin_xml_file: xml_file_path,
            path_to_addin_dll_folder: dll_folder_path,
            name: xml_addin.name.clone().unwrap_or_default(),
            version: "1.0.0".to_string(), // Default version, could be extracted from XML if available
            vendor: xml_addin.vendor_id.clone().unwrap_or_default(),
            email: xml_addin.vendor_email.clone().unwrap_or_default(),
            addin_type: xml_addin.addin_type.clone().unwrap_or_default(),
            vendor_description: xml_addin.vendor_description.clone().unwrap_or_default(),
            revit_version,
        }
    }

    /// Create a new AddinModel from XML data and file paths. Should be used for addins in the library
    pub fn from_xml_data(
        xml_file_path: String,
        dll_folder_path: String,
        xml_addin: &crate::services::addins_registry::models::addin_xml_model::AddIn,
    ) -> Self {
        Self::from_xml_common(xml_file_path, dll_folder_path, xml_addin, None)
    }

    /// Create a new AddinModel from XML data and file paths. Should be used for addins in the user's local addins folder
    pub fn from_local_xml_data(
        xml_file_path: String,
        dll_folder_path: String,
        xml_addin: &crate::services::addins_registry::models::addin_xml_model::AddIn,
        revit_version: String,
    ) -> Self {
        Self::from_xml_common(
            xml_file_path,
            dll_folder_path,
            xml_addin,
            Some(revit_version),
        )
    }
}
