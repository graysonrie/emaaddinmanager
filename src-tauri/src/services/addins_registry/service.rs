use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::addins_registry::models::addin_xml_model::RevitAddIns;
use log::{error, info, warn};
use std::fs;
use std::path::Path;

pub enum RegistryLocation {
    Local,
    Other,
}

pub struct AddinsRegistryService {
    location: RegistryLocation,
}

impl AddinsRegistryService {
    pub fn new(location: RegistryLocation) -> Self {
        Self { location }
    }

    pub fn get_addins(&self, path: &str) -> Vec<AddinModel> {
        match &self.location {
            RegistryLocation::Local => Self::find_addins_recursively(path),
            RegistryLocation::Other => {
                panic!("Not implemented");
            }
        }
    }

    /// Recursively search for Revit addins in the given directory
    fn find_addins_recursively(dir_path: &str) -> Vec<AddinModel> {
        let mut addins = Vec::new();
        let path = Path::new(dir_path);

        if !path.exists() {
            error!("Directory does not exist: {}", dir_path);
            return addins;
        }

        if !path.is_dir() {
            error!("Path is not a directory: {}", dir_path);
            return addins;
        }

        info!("Searching for addins in: {}", dir_path);

        if let Err(e) = Self::search_directory_recursively(path, &mut addins) {
            error!("Error searching directory {}: {}", dir_path, e);
        }

        info!("Found {} addins in {}", addins.len(), dir_path);
        addins
    }

    /// Recursively search a directory for .addin files
    fn search_directory_recursively(
        dir_path: &Path,
        addins: &mut Vec<AddinModel>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let entries = fs::read_dir(dir_path)?;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                // Recursively search subdirectories
                if let Err(e) = Self::search_directory_recursively(&path, addins) {
                    warn!("Error searching subdirectory {:?}: {}", path, e);
                }
            } else if path.is_file() {
                // Check if this is a .addin file
                if let Some(extension) = path.extension() {
                    if extension == "addin" {
                        if let Err(e) = Self::process_addin_file(&path, addins) {
                            warn!("Error processing addin file {:?}: {}", path, e);
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
        addins: &mut Vec<AddinModel>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        info!("Processing addin file: {:?}", xml_file_path);

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
            warn!(
                "DLL folder not found for addin {:?}: {:?}",
                xml_file_path, dll_folder_path
            );
        }

        // Convert each addin in the XML to our AddinModel
        for xml_addin in &revit_addins.add_in {
            let addin_model = AddinModel::from_xml_data(
                xml_file_path.to_string_lossy().to_string(),
                dll_folder_path.to_string_lossy().to_string(),
                xml_addin,
            );
            addins.push(addin_model);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_find_addins_recursively() {
        // Create a temporary directory structure for testing
        let temp_dir = std::env::temp_dir().join("revit_addins_test");

        // Clean up any existing test directory
        if temp_dir.exists() {
            fs::remove_dir_all(&temp_dir).unwrap();
        }

        // Create test directory structure
        fs::create_dir_all(&temp_dir).unwrap();

        // Create a sample .addin file
        let addin_file = temp_dir.join("TestAddin.addin");
        let xml_content = r#"<?xml version="1.0" encoding="utf-8"?>
<RevitAddIns>
    <AddIn Type="Application">
        <Name>TestAddin</Name>
        <Assembly>TestAddin\TestAddin.dll</Assembly>
        <AddInId>86f6bbab-c9af-4e53-86d6-0ea571d3bebe</AddInId>
        <FullClassName>TestAddin.App</FullClassName>
        <VendorId>TestVendor</VendorId>
        <VendorDescription>Test addin for testing</VendorDescription>
        <VendorEmail>test@example.com</VendorEmail>
    </AddIn>
</RevitAddIns>"#;
        fs::write(&addin_file, xml_content).unwrap();

        // Create the corresponding DLL folder
        let dll_folder = temp_dir.join("TestAddin");
        fs::create_dir_all(&dll_folder).unwrap();

        // Test the recursive search
        let addins = AddinsRegistryService::find_addins_recursively(temp_dir.to_str().unwrap());

        // Clean up
        fs::remove_dir_all(&temp_dir).unwrap();

        // Verify results
        assert_eq!(addins.len(), 1);
        let addin = &addins[0];
        assert_eq!(addin.name, "TestAddin");
        assert_eq!(addin.vendor, "TestVendor");
        assert_eq!(addin.email, "test@example.com");
        assert_eq!(addin.addin_type, "Application");
        assert!(addin.path_to_addin_xml_file.contains("TestAddin.addin"));
        assert!(addin.path_to_addin_dll_folder.contains("TestAddin"));
    }
}
