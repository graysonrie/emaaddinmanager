use std::path::Path;

use revitcli::AddinFileInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimplifiedAddinInfoModel {
    pub name: String,
    pub email: String,
    pub vendor_id: String,
    pub description: String,
    pub csharp_project_name: String,
    pub addin_version: String,
}

impl From<AddinFileInfo> for SimplifiedAddinInfoModel {
    fn from(addin_file_info: AddinFileInfo) -> Self {
        SimplifiedAddinInfoModel {
            name: addin_file_info.name,
            vendor_id: addin_file_info.vendor_id,
            description: addin_file_info.vendor_description,
            email: addin_file_info.vendor_email,
            // TODO: This is a hack to get the C# project name from the assembly name.
            csharp_project_name: get_csharp_project_name_from_assembly(&addin_file_info.assembly),
            addin_version: addin_file_info
                .addin_version
                .unwrap_or_else(|| "0".to_string()),
        }
    }
}

fn get_csharp_project_name_from_assembly(assembly: &str) -> String {
    let assembly_path = Path::new(&assembly);
    let assembly_name = assembly_path.file_name().unwrap().to_str().unwrap();
    let assembly_name = assembly_name.to_string();
    assembly_name.replace(".dll", "")
}
