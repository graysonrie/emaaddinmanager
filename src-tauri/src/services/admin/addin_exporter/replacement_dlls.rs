use std::fs;
use std::path::{Path, PathBuf};

use super::models::replacement_year_model::ReplacementYearModel;

pub fn is_valid_year(year: &str) -> bool {
    year.len() == 4 && year.chars().all(|c| c.is_ascii_digit())
}

pub fn validate_year(year: &str) -> Result<(), String> {
    if is_valid_year(year) {
        Ok(())
    } else {
        Err(format!(
            "Invalid Revit year '{}': expected a 4-digit year",
            year
        ))
    }
}

pub fn replacement_dir(destination: &Path, addin_name: &str, year: &str) -> PathBuf {
    destination.join(format!("{}_{}", addin_name, year))
}

/// Sibling override folder next to the base DLL folder for a given year.
pub fn replacement_dir_for_base_folder(base_dll_folder: &Path, year: &str) -> Option<PathBuf> {
    let parent = base_dll_folder.parent()?;
    let addin_name = base_dll_folder.file_name()?.to_str()?;
    Some(replacement_dir(parent, addin_name, year))
}

/// Local install paths look like `.../Addins/{year}/{AddinName}`.
pub fn revit_year_from_local_dll_folder(local_dll_folder: &Path) -> Option<String> {
    local_dll_folder
        .parent()
        .and_then(|p| p.file_name())
        .and_then(|n| n.to_str())
        .filter(|y| is_valid_year(y))
        .map(|s| s.to_string())
}

fn list_files_in_dir(dir: &Path) -> Result<Vec<String>, String> {
    let mut files = Vec::new();
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                files.push(name.to_string());
            }
        }
    }
    files.sort();
    Ok(files)
}

pub fn list_replacement_years(
    destination: &str,
    addin_name: &str,
) -> Result<Vec<ReplacementYearModel>, String> {
    let destination = Path::new(destination);
    if !destination.exists() {
        return Ok(Vec::new());
    }

    let prefix = format!("{}_", addin_name);
    let mut results = Vec::new();

    for entry in fs::read_dir(destination).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let Some(folder_name) = path.file_name().and_then(|n| n.to_str()) else {
            continue;
        };
        if !folder_name.starts_with(&prefix) {
            continue;
        }

        let year = &folder_name[prefix.len()..];
        if !is_valid_year(year) {
            continue;
        }

        let files = list_files_in_dir(&path)?;
        if files.is_empty() {
            continue;
        }

        results.push(ReplacementYearModel {
            year: year.to_string(),
            files,
        });
    }

    results.sort_by(|a, b| a.year.cmp(&b.year));
    Ok(results)
}

pub fn set_replacement_dlls(
    destination: &str,
    addin_name: &str,
    year: &str,
    source_paths: &[String],
) -> Result<(), String> {
    validate_year(year)?;
    if source_paths.is_empty() {
        return Err("At least one DLL file is required".to_string());
    }

    let dest_dir = replacement_dir(Path::new(destination), addin_name, year);
    fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;

    for source in source_paths {
        let src = Path::new(source);
        if !src.is_file() {
            return Err(format!("Source file does not exist: {}", source));
        }
        let file_name = src
            .file_name()
            .ok_or_else(|| format!("Invalid source file name: {}", source))?;
        let target = dest_dir.join(file_name);
        fs::copy(src, &target).map_err(|e| {
            format!(
                "Failed to copy {} to {}: {}",
                src.display(),
                target.display(),
                e
            )
        })?;
    }

    Ok(())
}

pub fn remove_replacement_dlls(
    destination: &str,
    addin_name: &str,
    year: &str,
) -> Result<(), String> {
    validate_year(year)?;
    let dest_dir = replacement_dir(Path::new(destination), addin_name, year);
    if !dest_dir.exists() {
        return Ok(());
    }
    fs::remove_dir_all(&dest_dir).map_err(|e| {
        format!(
            "Failed to remove replacement folder {}: {}",
            dest_dir.display(),
            e
        )
    })
}

pub fn remove_replacement_dll_file(
    destination: &str,
    addin_name: &str,
    year: &str,
    file_name: &str,
) -> Result<(), String> {
    validate_year(year)?;
    if file_name.is_empty()
        || file_name.contains(['/', '\\'])
        || file_name == "."
        || file_name == ".."
    {
        return Err("Invalid file name".to_string());
    }

    let dest_dir = replacement_dir(Path::new(destination), addin_name, year);
    let target = dest_dir.join(file_name);
    if target.exists() {
        fs::remove_file(&target).map_err(|e| {
            format!(
                "Failed to remove replacement file {}: {}",
                target.display(),
                e
            )
        })?;
    }

    // Clean up empty year folder
    if dest_dir.exists() {
        let remaining = list_files_in_dir(&dest_dir)?;
        if remaining.is_empty() {
            let _ = fs::remove_dir_all(&dest_dir);
        }
    }

    Ok(())
}

/// Copy override files from `{AddinName}_{year}` over an already-copied base install folder.
pub fn overlay_replacement_dlls(
    base_dll_folder: &Path,
    target_dll_folder: &Path,
    year: &str,
) -> Result<(), String> {
    if !is_valid_year(year) {
        return Ok(());
    }

    let Some(replacement) = replacement_dir_for_base_folder(base_dll_folder, year) else {
        return Ok(());
    };

    if !replacement.is_dir() {
        return Ok(());
    }

    fs::create_dir_all(target_dll_folder).map_err(|e| e.to_string())?;

    for entry in fs::read_dir(&replacement).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let src = entry.path();
        if !src.is_file() {
            continue;
        }
        let Some(file_name) = src.file_name() else {
            continue;
        };
        let dst = target_dll_folder.join(file_name);
        fs::copy(&src, &dst).map_err(|e| {
            format!(
                "Failed to overlay replacement DLL {} onto {}: {}",
                src.display(),
                dst.display(),
                e
            )
        })?;
    }

    Ok(())
}
