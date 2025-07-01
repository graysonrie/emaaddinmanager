use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::addins_registry::models::addin_xml_model::RevitAddIns;
use crate::utils;
use std::fs;
use std::path::Path;

pub struct LocalAddinsService {}

impl LocalAddinsService {
    /// Typically C:\Users\<username>\AppData\Roaming\Autodesk\Revit\Addins\2024
    pub fn path_to_local_addins_folder() -> Result<String, Box<dyn std::error::Error>> {
        let data_roaming = dirs::data_dir().ok_or("Could not get data roaming directory")?;

        let path = data_roaming.join("Autodesk").join("Revit").join("Addins");

        let path_str = path
            .to_str()
            .ok_or("Path contains invalid UTF-8 characters")?;

        Ok(path_str.to_string())
    }

    /// Returns a list of all the Revit versions that have addins installed
    ///
    /// Example: ["2024", "2025", "2026"]
    pub fn get_revit_versions() -> Result<Vec<String>, String> {
        let path = match Self::path_to_local_addins_folder() {
            Ok(path) => path,
            Err(e) => {
                return Err(format!("Error getting local addins folder path: {}", e));
            }
        };

        let mut versions = Vec::new();

        match std::fs::read_dir(&path) {
            Ok(entries) => {
                for entry in entries {
                    match entry {
                        Ok(entry) => {
                            let path = entry.path();
                            if path.is_dir() {
                                if let Some(file_name) = path.file_name() {
                                    if let Some(version) = file_name.to_str() {
                                        versions.push(version.to_string());
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            return Err(format!("Error reading directory entry: {}", e));
                        }
                    }
                }
            }
            Err(e) => {
                return Err(format!("Error reading directory {}: {}", path, e));
            }
        }

        Ok(versions)
    }

    pub fn get_local_addins() -> Result<Vec<AddinModel>, String> {
        let mut all_addins = Vec::new();
        let versions = match Self::get_revit_versions() {
            Ok(versions) => versions,
            Err(e) => {
                return Err(e);
            }
        };

        let base_path = match Self::path_to_local_addins_folder() {
            Ok(path) => path,
            Err(e) => {
                return Err(format!("Error getting local addins folder path: {}", e));
            }
        };

        for version in versions {
            let version_path = Path::new(&base_path).join(&version);

            if let Err(e) = Self::scan_version_folder(&version_path, &version, &mut all_addins) {
                return Err(format!("Error scanning version folder {}: {}", version, e));
            }
        }

        Ok(all_addins)
    }

    /// Scan a specific Revit version folder for .addin files
    fn scan_version_folder(
        version_path: &Path,
        revit_version: &str,
        addins: &mut Vec<AddinModel>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        if !version_path.exists() || !version_path.is_dir() {
            return Ok(());
        }

        for entry in fs::read_dir(version_path)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_file() {
                // Check if this is a .addin file
                if let Some(extension) = path.extension() {
                    if extension == "addin" {
                        if let Err(e) = Self::process_addin_file(&path, revit_version, addins) {
                            println!("Error processing addin file {:?}: {}", path, e);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// Process a single .addin file and extract addin information
    fn process_addin_file(
        xml_file_path: &Path,
        revit_version: &str,
        addins: &mut Vec<AddinModel>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // Try to parse the XML file
        let revit_addins = RevitAddIns::from_file(xml_file_path)?;

        // Get the directory containing the .addin file
        let xml_dir = xml_file_path
            .parent()
            .ok_or("Could not get parent directory of XML file")?;

        // Get the base name of the .addin file (without extension)
        let xml_file_stem = xml_file_path
            .file_stem()
            .and_then(|s| s.to_str())
            .ok_or("Could not get file stem of XML file")?;

        // Look for the corresponding DLL folder
        let dll_folder_path = xml_dir.join(xml_file_stem);

        if !dll_folder_path.exists() {
            println!(
                "DLL folder not found for addin {:?}: {:?}",
                xml_file_path, dll_folder_path
            );
        }

        // Convert each addin in the XML to our AddinModel
        for xml_addin in &revit_addins.add_in {
            if let Some(addin_model) = AddinModel::from_local_xml_data(
                xml_file_path.to_string_lossy().to_string(),
                dll_folder_path.to_string_lossy().to_string(),
                xml_addin,
                revit_version.to_string(),
            ) {
                addins.push(addin_model);
            }
        }

        Ok(())
    }

    /// Checks if an addin with the given name, vendor, and addinType is installed locally
    pub fn is_addin_installed_locally(
        name: &str,
        vendor: &str,
        addin_type: &str,
    ) -> Result<bool, String> {
        let local_addins = Self::get_local_addins()?;
        Ok(local_addins.iter().any(|addin| {
            addin.name == name && addin.vendor == vendor && addin.addin_type == addin_type
        }))
    }

    pub fn install_addin(
        addin: &AddinModel,
        for_revit_versions: &[String],
    ) -> Result<(), Box<dyn std::error::Error>> {
        let base_path = Self::path_to_local_addins_folder()?;

        for version in for_revit_versions {
            let version_path = Path::new(&base_path).join(version);

            // Ensure the version directory exists
            fs::create_dir_all(&version_path)?;

            // Copy the .addin file
            let addin_xml_src = Path::new(&addin.path_to_addin_xml_file);
            let addin_xml_dst = version_path.join(
                addin_xml_src
                    .file_name()
                    .ok_or("Invalid addin XML file name")?,
            );
            fs::copy(addin_xml_src, &addin_xml_dst)?;

            // Copy the DLL folder (recursively)
            let dll_src = Path::new(&addin.path_to_addin_dll_folder);
            let dll_dst = version_path.join(dll_src.file_name().ok_or("Invalid DLL folder name")?);
            if dll_src.exists() && dll_src.is_dir() {
                utils::copy_dir_all(dll_src, &dll_dst)?;
            }
        }
        Ok(())
    }

    pub fn uninstall_addin(
        addin: &AddinModel,
        for_revit_versions: &[String],
    ) -> Result<(), Box<dyn std::error::Error>> {
        let base_path = Self::path_to_local_addins_folder()?;

        for version in for_revit_versions {
            let version_path = Path::new(&base_path).join(version);

            // Get the file names from the source paths
            let addin_xml_src = Path::new(&addin.path_to_addin_xml_file);
            let dll_src = Path::new(&addin.path_to_addin_dll_folder);

            // Remove the .addin file
            if let Some(file_name) = addin_xml_src.file_name() {
                let addin_xml_dst = version_path.join(file_name);
                if addin_xml_dst.exists() {
                    fs::remove_file(&addin_xml_dst)?;
                }
            }

            // Remove the DLL folder (recursively)
            if let Some(folder_name) = dll_src.file_name() {
                let dll_dst = version_path.join(folder_name);
                if dll_dst.exists() && dll_dst.is_dir() {
                    fs::remove_dir_all(&dll_dst)?;
                }
            }
        }
        Ok(())
    }
}
