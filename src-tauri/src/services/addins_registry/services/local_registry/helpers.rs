use std::{fs, path::Path};

use log::{info, warn};

use crate::services::{
    addin_exporter::models::category_model::CategoryModel,
    addins_registry::models::{addin_model::AddinModel, addin_xml_model::RevitAddIns},
    local_addins::service::LocalAddinsService,
};

/// Recursively search a directory for .addin files
pub fn search_directory_recursively(
    dir_path: &Path,
    addins: &mut Vec<AddinModel>,
) -> Result<(), std::io::Error> {
    let entries = fs::read_dir(dir_path)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            // Recursively search subdirectories
            if let Err(e) = search_directory_recursively(&path, addins) {
                warn!("Error searching subdirectory {:?}: {}", path, e);
            }
        } else if path.is_file() {
            // Check if this is a .addin file
            if let Some(extension) = path.extension() {
                if extension == "addin" {
                    if let Err(e) = process_addin_file(&path, addins) {
                        warn!("Error processing addin file {:?}: {}", path, e);
                    }
                }
            }
        }
    }

    Ok(())
}

/// Process a single .addin file and extract addin information
pub fn process_addin_file(
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
        if let Some(mut addin_model) = AddinModel::from_xml_data(
            xml_file_path.to_string_lossy().to_string(),
            dll_folder_path.to_string_lossy().to_string(),
            xml_addin,
        ) {
            let is_installed = LocalAddinsService::is_addin_installed_locally(
                &addin_model.name,
                &addin_model.vendor,
                &addin_model.addin_type,
            )?;
            addin_model.is_installed_locally = is_installed;
            // Set the flag or wrap the model as needed
            addins.push(addin_model);
        }
    }

    Ok(())
}

/// Recursively scan for categories (directories)
pub fn scan_categories_recursively(
    path: &Path,
    categories: &mut Vec<CategoryModel>,
) -> Result<(), std::io::Error> {
    let entries = fs::read_dir(path)?;
    for entry in entries {
        let entry = entry?;
        let entry_path = entry.path();

        if entry_path.is_dir() {
            // Check if this directory contains any DLL files
            if !contains_dll_files(&entry_path)? {
                // Only add directories that don't contain DLL files
                categories.push(CategoryModel {
                    name: entry_path
                        .file_name()
                        .unwrap()
                        .to_string_lossy()
                        .to_string(),
                    full_path: entry_path.to_string_lossy().to_string(),
                });
            }

            // Recursively scan subdirectories
            scan_categories_recursively(&entry_path, categories)?;
        }
    }
    Ok(())
}

/// Check if a directory contains any DLL files (recursively)
pub fn contains_dll_files(path: &Path) -> Result<bool, std::io::Error> {
    let entries = fs::read_dir(path)?;
    for entry in entries {
        let entry = entry?;
        let entry_path = entry.path();

        if entry_path.is_file() {
            // Check if the file has a .dll extension
            if let Some(extension) = entry_path.extension() {
                if extension.to_string_lossy().to_lowercase() == "dll" {
                    return Ok(true);
                }
            }
        }
    }
    Ok(false)
}
