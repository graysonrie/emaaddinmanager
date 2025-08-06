use std::{fs, path::Path};

use chrono::{DateTime, Utc};

use crate::services::{
    addin_updater::service::CheckForUpdatesError, addins_registry::models::addin_model::AddinModel,
};

/// Helper function to ensure target directory exists
fn ensure_target_directory_exists(target_path: &Path) -> Result<(), CheckForUpdatesError> {
    if !target_path.exists() {
        fs::create_dir_all(target_path).map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to create target directory: {}", e))
        })?;
    }
    Ok(())
}

/// Helper function to check if a file should be copied (different size or modification time)
fn should_copy_file(source_path: &Path, target_path: &Path) -> Result<bool, CheckForUpdatesError> {
    if !target_path.exists() {
        return Ok(true);
    }

    let src_meta = fs::metadata(source_path).map_err(|e| {
        CheckForUpdatesError::Update(format!("Failed to get source metadata: {}", e))
    })?;
    let tgt_meta = fs::metadata(target_path).map_err(|e| {
        CheckForUpdatesError::Update(format!("Failed to get target metadata: {}", e))
    })?;

    Ok(src_meta.len() != tgt_meta.len()
        || src_meta.modified().map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to get source modified time: {}", e))
        })? != tgt_meta.modified().map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to get target modified time: {}", e))
        })?)
}

/// Helper function to copy a single file
fn copy_single_file(source_path: &Path, target_path: &Path) -> Result<(), CheckForUpdatesError> {
    fs::copy(source_path, target_path).map_err(|e| {
        CheckForUpdatesError::Update(format!(
            "Failed to copy file from {} to {}: {}",
            source_path.display(),
            target_path.display(),
            e
        ))
    })?;
    Ok(())
}

/// Helper function to copy all files from source to target directory
fn copy_directory_contents(
    source_dir: &Path,
    target_dir: &Path,
    file_filter: Option<fn(&Path) -> bool>,
) -> Result<(), CheckForUpdatesError> {
    if !source_dir.exists() {
        return Err(CheckForUpdatesError::Update(format!(
            "Source directory does not exist: {}",
            source_dir.display()
        )));
    }

    ensure_target_directory_exists(target_dir)?;

    for entry in fs::read_dir(source_dir).map_err(|e| {
        CheckForUpdatesError::Update(format!("Failed to read source directory: {}", e))
    })? {
        let entry = entry.map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to read directory entry: {}", e))
        })?;

        let source_path = entry.path();
        let target_path = target_dir.join(source_path.file_name().unwrap());

        // Apply file filter if provided
        if let Some(filter) = file_filter {
            if !filter(&source_path) {
                continue;
            }
        }

        if source_path.is_file() {
            if should_copy_file(&source_path, &target_path)? {
                copy_single_file(&source_path, &target_path)?;
            }
        } else if source_path.is_dir() {
            // Recursively copy subdirectories
            copy_directory_contents(&source_path, &target_path, file_filter)?;
        }
    }

    Ok(())
}

/// Copies all files from the up-to-date addin to the current addin, overwriting existing files
pub fn copy_all_files(
    up_to_date_addin: &AddinModel,
    current_addin: &AddinModel,
) -> Result<(), CheckForUpdatesError> {
    let source_dll_folder = Path::new(&up_to_date_addin.path_to_addin_dll_folder);
    let target_dll_folder = Path::new(&current_addin.path_to_addin_dll_folder);

    // Copy all files from DLL folder (no filter - copy everything)
    copy_directory_contents(source_dll_folder, target_dll_folder, None)?;

    Ok(())
}

/// Copies DLL files from the up-to-date addin to the current addin, overwriting existing files
///
/// ! Currently unused, but kept for reference
pub fn _copy_dll_files(
    up_to_date_addin: &AddinModel,
    current_addin: &AddinModel,
) -> Result<(), CheckForUpdatesError> {
    let source_dll_folder = Path::new(&up_to_date_addin.path_to_addin_dll_folder);
    let target_dll_folder = Path::new(&current_addin.path_to_addin_dll_folder);

    // Copy only DLL files
    copy_directory_contents(
        source_dll_folder,
        target_dll_folder,
        Some(|path| {
            path.extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext.eq_ignore_ascii_case("dll"))
                .unwrap_or(false)
        }),
    )?;

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

/// Gets the most recent modification time of any file in the addin's DLL folder
pub fn get_addin_modification_time(
    addin: &AddinModel,
) -> Result<DateTime<Utc>, CheckForUpdatesError> {
    let registry_addin_dll_folder_path = Path::new(&addin.path_to_addin_dll_folder);

    // Recursively find the most recent modification time of any file
    find_most_recent_file_time(registry_addin_dll_folder_path)?.ok_or_else(|| {
        CheckForUpdatesError::Update(format!(
            "No files found in directory {}",
            registry_addin_dll_folder_path.display()
        ))
    })
}

/// Recursively finds the most recent modification time of any file in a directory tree
fn find_most_recent_file_time(
    dir_path: &Path,
) -> Result<Option<DateTime<Utc>>, CheckForUpdatesError> {
    let entries = fs::read_dir(dir_path).map_err(|e| {
        CheckForUpdatesError::Update(format!(
            "Failed to read directory {}: {}",
            dir_path.display(),
            e
        ))
    })?;

    let mut most_recent_time: Option<DateTime<Utc>> = None;

    for entry in entries {
        let entry = entry.map_err(|e| {
            CheckForUpdatesError::Update(format!("Failed to read directory entry: {}", e))
        })?;

        let path = entry.path();
        let metadata = fs::metadata(&path).map_err(|e| {
            CheckForUpdatesError::Update(format!(
                "Failed to get metadata for {}: {}",
                path.display(),
                e
            ))
        })?;

        if metadata.is_file() {
            // Check file modification time
            let modification_time = metadata.modified().map_err(|e| {
                CheckForUpdatesError::Update(format!(
                    "Failed to get modification time for {}: {}",
                    path.display(),
                    e
                ))
            })?;

            let modification_datetime: DateTime<Utc> = modification_time.into();

            // Update most recent time if this file is newer
            match most_recent_time {
                Some(current_most_recent) => {
                    if modification_datetime > current_most_recent {
                        most_recent_time = Some(modification_datetime);
                    }
                }
                None => {
                    most_recent_time = Some(modification_datetime);
                }
            }
        } else if metadata.is_dir() {
            // Recursively check subdirectories - handle empty subdirectories gracefully
            if let Ok(Some(subdir_most_recent)) = find_most_recent_file_time(&path) {
                // Update most recent time if subdirectory has newer files
                match most_recent_time {
                    Some(current_most_recent) => {
                        if subdir_most_recent > current_most_recent {
                            most_recent_time = Some(subdir_most_recent);
                        }
                    }
                    None => {
                        most_recent_time = Some(subdir_most_recent);
                    }
                }
            }
            // If subdirectory is empty or has no files, just continue
        }
        // Skip other types (symlinks, etc.)
    }

    Ok(most_recent_time)
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
