use std::{
    env,
    fs::{self, File},
    io::{Read, Write},
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

#[cfg(test)]
mod tests;

use walkdir::WalkDir;
use zip::write::SimpleFileOptions;

/// Recursively looks through the given directory and for each addin DLL folder, makes a zip out of it.
/// An addin DLL folder is any folder that also has a '.addin' file of the same name outside
pub fn create_zips_for_addin_dll_folders_recursive(dir: impl AsRef<Path>) -> anyhow::Result<()> {
    for entry in WalkDir::new(dir).into_iter().flatten() {
        let path = entry.path();
        if path.is_dir() {
            let dir_name = path
                .file_name()
                .ok_or_else(|| anyhow::anyhow!("No file"))?
                .to_string_lossy();

            let expected_addin_file_name = format!("{dir_name}.addin");
            let path_parent = path
                .parent()
                .ok_or_else(|| anyhow::anyhow!("Path has no parent"))?;
            let expected_addin_file_path = path_parent.join(expected_addin_file_name);

            if expected_addin_file_path.exists() {
                // Create the zip file for the DLL folder
                addin_dll_folder_into_zip(path)?;
            }
        }
    }

    Ok(())
}

pub fn addin_dll_folder_into_zip(dll_folder_path: impl AsRef<Path>) -> anyhow::Result<()> {
    let dll_folder_path = dll_folder_path.as_ref();

    let dll_folder_name = dll_folder_path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("No file"))?
        .to_string_lossy()
        .into_owned();

    let zip_path = dll_folder_path
        .parent()
        .ok_or_else(|| anyhow::anyhow!("No file"))?
        .join(format!("{dll_folder_name}_ZIP"));

    let temp_zip_path = env::temp_dir().join(format!(
        "{dll_folder_name}_{}_ZIP",
        SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos()
    ));

    let temp_zip_file = File::create(&temp_zip_path)?;
    let mut zip = zip::ZipWriter::new(temp_zip_file);

    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Zstd)
        .unix_permissions(0o755);

    let base_path = dll_folder_path;

    for entry in WalkDir::new(base_path).into_iter().flatten() {
        let path = entry.path();
        let name = path.strip_prefix(base_path)?;

        if path.is_file() {
            zip.start_file(name.to_string_lossy(), options)?;
            let mut f = File::open(path)?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(name.to_string_lossy(), options)?;
        }
    }

    zip.finish()?;

    let copy_result = (|| {
        if zip_path.exists() {
            fs::remove_file(&zip_path)?;
        }
        fs::copy(&temp_zip_path, &zip_path)?;
        Ok::<(), anyhow::Error>(())
    })();

    let _ = fs::remove_file(&temp_zip_path);
    copy_result?;

    Ok(())
}

/// Will create the output folder if it does not exist
pub fn unzip_folder_contents_into(
    path_to_zip_file: impl AsRef<Path>,
    path_to_output_folder: impl AsRef<Path>,
) -> anyhow::Result<()> {
    let zip_file = File::open(path_to_zip_file)?;
    let mut archive = zip::ZipArchive::new(zip_file)?;
    archive.extract(path_to_output_folder)?;
    Ok(())
}
