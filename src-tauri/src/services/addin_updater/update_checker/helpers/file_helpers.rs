use std::{fs, path::Path};

use chrono::{DateTime, Utc};

use crate::services::{
    addin_updater::service::CheckForUpdatesError, addins_registry::models::addin_model::AddinModel,
};

pub fn copy_dll_files(
    up_to_date_addin: &AddinModel,
    current_addin: &AddinModel,
) -> Result<(), CheckForUpdatesError> {
    let source_dll_folder = Path::new(&up_to_date_addin.path_to_addin_dll_folder);
    let target_dll_folder = Path::new(&current_addin.path_to_addin_dll_folder);

    if !source_dll_folder.exists() {
        return Err(CheckForUpdatesError::Update(format!(
            "Source DLL folder does not exist: {}",
            source_dll_folder.display()
        )));
    }

    // Create target directory if it doesn't exist (for fresh installations)
    if !target_dll_folder.exists() {
        fs::create_dir_all(target_dll_folder).map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to create target directory: {}", e))
        })?;
    }

    // Copy all files from source to target, overwriting existing files
    for entry in fs::read_dir(source_dll_folder).map_err(|e| {
        CheckForUpdatesError::Update(format!("Failed to read source directory: {}", e))
    })? {
        let entry = entry.map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to read directory entry: {}", e))
        })?;

        let source_path = entry.path();
        let target_path = target_dll_folder.join(source_path.file_name().unwrap());

        if source_path.is_file() {
            // Only copy if file is missing or different
            let should_copy = if target_path.exists() {
                let src_meta = fs::metadata(&source_path).map_err(|e| {
                    CheckForUpdatesError::Update(format!("Failed to get source metadata: {}", e))
                })?;
                let tgt_meta = fs::metadata(&target_path).map_err(|e| {
                    CheckForUpdatesError::Update(format!("Failed to get target metadata: {}", e))
                })?;
                src_meta.len() != tgt_meta.len()
                    || src_meta.modified().map_err(|e| {
                        CheckForUpdatesError::Update(format!(
                            "Failed to get source modified time: {}",
                            e
                        ))
                    })? != tgt_meta.modified().map_err(|e| {
                        CheckForUpdatesError::Update(format!(
                            "Failed to get target modified time: {}",
                            e
                        ))
                    })?
            } else {
                true
            };

            if should_copy {
                fs::copy(&source_path, &target_path).map_err(|e| {
                    CheckForUpdatesError::Update(format!(
                        "Failed to copy file from {} to {}: {}",
                        source_path.display(),
                        target_path.display(),
                        e
                    ))
                })?;
            }
        }
    }

    Ok(())
}

pub fn copy_xml_file(
    up_to_date_addin: &AddinModel,
    current_addin: &AddinModel,
) -> Result<(), CheckForUpdatesError> {
    let source_xml_path = Path::new(&up_to_date_addin.path_to_addin_xml_file);
    let target_xml_path = Path::new(&current_addin.path_to_addin_xml_file);

    if !source_xml_path.exists() {
        return Err(CheckForUpdatesError::Update(format!(
            "Source XML file does not exist: {}",
            source_xml_path.display()
        )));
    }

    // Ensure target directory exists
    if let Some(target_dir) = target_xml_path.parent() {
        fs::create_dir_all(target_dir).map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to create target directory: {}", e))
        })?;
    }

    // Copy the XML file, overwriting if it exists
    fs::copy(source_xml_path, target_xml_path).map_err(|e| {
        CheckForUpdatesError::Update(format!(
            "Failed to copy XML file from {} to {}: {}",
            source_xml_path.display(),
            target_xml_path.display(),
            e
        ))
    })?;

    Ok(())
}

pub fn get_addin_dll_modification_time(
    addin: &AddinModel,
) -> Result<DateTime<Utc>, CheckForUpdatesError> {
    let registry_addin_dll_folder_path = Path::new(&addin.path_to_addin_dll_folder);
    let dll_folder_name = get_addin_dll_folder_name(addin)?;
    let dll_path = registry_addin_dll_folder_path.join(format!("{}.dll", dll_folder_name));

    let metadata = fs::metadata(&dll_path).map_err(|e| {
        CheckForUpdatesError::Update(format!(
            "Failed to get metadata for {}: {}",
            dll_path.display(),
            e
        ))
    })?;

    let modification_time = metadata.modified().map_err(|e| {
        CheckForUpdatesError::Update(format!(
            "Failed to get modification time for {}: {}",
            dll_path.display(),
            e
        ))
    })?;

    Ok(modification_time.into())
}

pub fn get_addin_dll_folder_name(addin: &AddinModel) -> Result<String, CheckForUpdatesError> {
    let registry_addin_dll_folder_path = Path::new(&addin.path_to_addin_dll_folder);
    let dll_folder_name = registry_addin_dll_folder_path
        .file_name()
        .ok_or_else(|| {
            CheckForUpdatesError::Update(format!(
                "Invalid DLL folder path: {}",
                addin.path_to_addin_dll_folder
            ))
        })?
        .to_str()
        .ok_or_else(|| {
            CheckForUpdatesError::Update(format!(
                "DLL folder name contains invalid UTF-8: {}",
                addin.path_to_addin_dll_folder
            ))
        })?;

    Ok(dll_folder_name.to_string())
}
