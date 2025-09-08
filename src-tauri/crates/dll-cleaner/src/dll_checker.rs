use std::path::Path;

/// Returns the names of the dlls that exist in both locations
pub fn check_against_revit_dlls(
    path_to_your_dlls: &Path,
    path_to_revit_dlls: &Path,
) -> Result<Vec<String>, std::io::Error> {
    let your_dlls = get_all_dlls_in_dir(path_to_your_dlls)?;
    let revit_dlls = get_all_dlls_in_dir(path_to_revit_dlls)?;

    Ok(your_dlls
        .into_iter()
        .filter(|dll| revit_dlls.contains(dll))
        .to_owned()
        .collect())
}

fn get_all_dlls_in_dir(dir: &Path) -> Result<Vec<String>, std::io::Error> {
    let mut dlls = Vec::new();
    let entries = dir.read_dir()?;
    for entry in entries {
        let entry = entry?;
        let file_name = entry.file_name();
        let file_name = file_name.to_string_lossy();
        if file_name.ends_with(".dll") {
            dlls.push(file_name.into_owned());
        }
    }
    Ok(dlls)
}
