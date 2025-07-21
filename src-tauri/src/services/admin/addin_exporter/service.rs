use std::path::Path;

use revitcli::{AddinFileInfo, ErrorList};

use crate::services::admin::addin_exporter::models::dll_model::DllModel;
use crate::services::admin::addin_exporter::models::simplified_addin_info_model::SimplifiedAddinInfoModel;

pub struct AddinExporterService {}

impl AddinExporterService {
    /// Returns the contents of the .addin xml file for the project directory
    ///
    /// If the .addin file is not found, an error is returned
    pub fn get_addin_file_info(project_dir: &str) -> Result<SimplifiedAddinInfoModel, String> {
        revitcli::get_addin_file_info(project_dir)
            .map(|addin_file_info| addin_file_info.into())
            .map_err(|e| e.to_string())
    }
    /// Creates or overwrites the .addin file for the project directory
    ///
    /// If the .addin file is not found or cannot be created, an error is returned
    ///
    /// Returns the path to the .addin file
    pub fn create_addin_file_for_project(
        project_dir: &str,
        addin_file_info: SimplifiedAddinInfoModel,
    ) -> Result<String, String> {
        let project_name = revitcli::get_project_name(project_dir).map_err(|e| e.to_string())?;
        let assembly = format!("{}\\{}.dll", project_name, project_name);

        let addin_id = uuid::Uuid::new_v4().to_string();
        let full_class_name = format!("{}.App", project_name);

        let addin_file_info = AddinFileInfo {
            name: addin_file_info.name,
            assembly,
            addin_id,
            full_class_name,
            vendor_id: addin_file_info.vendor_id,
            vendor_description: addin_file_info.description,
            vendor_email: addin_file_info.email,
        };

        let path = revitcli::create_addin_file_for_project(project_dir, addin_file_info)
            .map_err(|e| e.to_string())?;

        if !Path::exists(Path::new(&path)) {
            return Err(format!("Failed to create addin file at path: {}", path));
        }

        Ok(path)
    }
    /// Exports the addin to the destination directory
    ///
    /// If the .addin file is not found, an error is returned
    pub async fn export_locally(
        project_dir: &str,
        extra_dlls: &[&str],
        destination_dir: &str,
    ) -> ErrorList {
        let destination_dir_path = Path::new(destination_dir);
        revitcli::export_addin(project_dir, extra_dlls, destination_dir_path).await
    }

    /// Returns all the DLLs in the project directory
    ///
    /// An error is returned if any one of the DLLs has an invalid name
    pub fn get_all_project_dlls(project_dir: &str) -> Result<Vec<DllModel>, String> {
        match revitcli::get_project_dlls(project_dir) {
            Ok(dlls) => {
                let mut result = Vec::new();
                for dll in dlls {
                    let name = Path::new(&dll)
                        .file_name()
                        .ok_or("Failed to get filename")?
                        .to_str()
                        .ok_or("Failed to convert filename to string")?
                        .to_string()
                        .trim_end_matches(".dll")
                        .to_string();
                    if result.iter().any(|d: &DllModel| d.name == name) {
                        // Duplicate DLL found, skip
                        // This can happen if the project was compiled for different architectures
                        continue;
                    }
                    result.push(DllModel {
                        full_path: dll,
                        name,
                    });
                }
                Ok(result)
            }
            Err(e) => Err(e),
        }
    }

    /// Builds the addin
    ///
    /// An error is returned if the addin fails to build
    ///
    /// Otherwise, returns the output of the build command
    pub async fn build_addin(project_dir: &str) -> Result<String, String> {
        revitcli::build_project(project_dir).await
    }
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
        }
    }
}

fn get_csharp_project_name_from_assembly(assembly: &str) -> String {
    let assembly_path = Path::new(&assembly);
    let assembly_name = assembly_path.file_name().unwrap().to_str().unwrap();
    let assembly_name = assembly_name.to_string();
    assembly_name.replace(".dll", "")
}
