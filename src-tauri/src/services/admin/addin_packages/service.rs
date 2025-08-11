use serde_json;
use std::{
    fs::{self},
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::services::{
    addins_registry::models::addin_model::AddinModel,
    admin::addin_packages::models::{AddinPackageInfoModel, CreateAddinPackageRequestModel},
    app_save::service::AppSaveService,
    config::keys,
    local_db::service::LocalDbService,
};

const CREATE_NO_WINDOW: u32 = 0x08000000;
pub const JSON_FILE_NAME: &str = "info.json";

pub struct AddinPackagesService {
    app_save_service: Arc<AppSaveService>,
    local_db: Arc<LocalDbService>,
}

impl AddinPackagesService {
    pub fn new(local_db: Arc<LocalDbService>, app_save_service: Arc<AppSaveService>) -> Self {
        Self {
            local_db,
            app_save_service,
        }
    }

    pub async fn create_package_for_registry_addin(
        &self,
        addin: &AddinModel,
        request: &CreateAddinPackageRequestModel,
    ) -> Result<(), String> {
        let packages_path = self.get_addin_packages_path().await?;

        // Create the addin package directory
        let addin_package_dir = packages_path.join(&request.display_name);
        fs::create_dir_all(&addin_package_dir)
            .map_err(|e| format!("Failed to create package directory: {}", e))?;

        // Copy the image file
        let image_source = Path::new(&request.path_to_image_file);
        let image_dest =
            addin_package_dir.join(image_source.file_name().ok_or("Invalid image file path")?);

        // Only copy if source and destination are different (avoid copying file onto itself)
        if image_source
            .canonicalize()
            .map_err(|e| format!("Failed to resolve source path: {}", e))?
            != image_dest
                .canonicalize()
                .unwrap_or_else(|_| image_dest.clone())
        {
            fs::copy(image_source, &image_dest)
                .map_err(|e| format!("Failed to copy image file: {}", e))?;
        }

        // Copy the help file if provided
        if let Some(help_file_path) = &request.path_to_help_file {
            let help_source = Path::new(help_file_path);
            let help_dest =
                addin_package_dir.join(help_source.file_name().ok_or("Invalid help file path")?);

            // Only copy if source and destination are different (avoid copying file onto itself)
            if help_source
                .canonicalize()
                .map_err(|e| format!("Failed to resolve help source path: {}", e))?
                != help_dest
                    .canonicalize()
                    .unwrap_or_else(|_| help_dest.clone())
            {
                fs::copy(help_source, &help_dest)
                    .map_err(|e| format!("Failed to copy help file: {}", e))?;
            }
        }

        // Calculate the relative path to the addin directory from the registry root
        let registry_path = self.get_addins_registry_path().await?;
        let addin_dir_path = Path::new(&addin.path_to_addin_dll_folder);
        let relative_path_to_addin = if addin_dir_path.starts_with(&registry_path) {
            addin_dir_path
                .strip_prefix(&registry_path)
                .map(|p| {
                    // Normalize path separators to forward slashes for consistency
                    p.to_string_lossy().replace('\\', "/")
                })
                .unwrap_or_else(|_| addin.path_to_addin_dll_folder.clone())
        } else {
            addin.path_to_addin_dll_folder.clone()
        };

        // Create the package info model
        let package_info = AddinPackageInfoModel {
            package_info_version: "1.0.0".to_string(),
            addin_version: request.addin_version.clone(),
            relative_path_to_help_file: request.path_to_help_file.as_ref().map(|path| {
                Path::new(path)
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string()
            }),
            relative_path_to_image: image_source
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            relative_path_to_addin,
            absolute_path_to_help_file: request.path_to_help_file.clone(),
            absolute_path_to_image: image_dest.to_string_lossy().to_string(),
            display_name: request.display_name.clone(),
            discipline_package: request.discipline_package.clone(),
            emoji: request.emoji.clone(),
        };

        // Write the info.json file
        let info_json_path = addin_package_dir.join(JSON_FILE_NAME);
        let json_content = serde_json::to_string_pretty(&package_info)
            .map_err(|e| format!("Failed to serialize package info: {}", e))?;
        fs::write(info_json_path, json_content)
            .map_err(|e| format!("Failed to write info.json: {}", e))?;

        Ok(())
    }
    pub async fn get_all_addin_packages(&self) -> Result<Vec<AddinPackageInfoModel>, String> {
        let mut files = Vec::new();
        let path = self.get_addin_packages_path().await?;
        let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let entry_path = entry.path();
            let json_path = entry_path.join(JSON_FILE_NAME);
            if json_path.exists() {
                let text = fs::read_to_string(json_path).map_err(|e| e.to_string())?;
                let json_info: AddinPackageInfoModel =
                    serde_json::from_str(&text).map_err(|e| e.to_string())?;
                files.push(json_info);
            }
        }
        Ok(files)
    }
    /// The absolute path to where the addin packages are stored
    async fn get_addin_packages_path(&self) -> Result<PathBuf, String> {
        let registry_path_str = &keys::get_addins_registry_path(self.local_db.clone()).await?;
        let registry_path = Path::new(registry_path_str);
        Ok(Path::join(registry_path, "AddinPackages"))
    }

    /// Get the addins registry path
    async fn get_addins_registry_path(&self) -> Result<PathBuf, String> {
        let registry_path_str = keys::get_addins_registry_path(self.local_db.clone()).await?;
        Ok(PathBuf::from(registry_path_str))
    }

    pub async fn get_package_info_for_registry_addin(
        &self,
        addin: &AddinModel,
    ) -> Result<Option<AddinPackageInfoModel>, String> {
        let all_packages = self.get_all_addin_packages().await?;
        let package = all_packages.iter().find(|p| {
            let package_addin_name = p
                .relative_path_to_addin
                .split('/')
                .next_back()
                .unwrap_or_default();
            let normalized_addin_name = addin.path_to_addin_dll_folder.replace('\\', "/");
            let addin_name = normalized_addin_name
                .split('/')
                .next_back()
                .unwrap_or_default();

            // println!("Comparing {} to {}", package_addin_name, addin_name);
            package_addin_name == addin_name
        });
        if let Some(package) = package {
            return Ok(Some(package.clone()));
        }
        Ok(None)
    }

    pub async fn load_image_data_for_package(
        &self,
        package: &AddinPackageInfoModel,
    ) -> Result<(Vec<u8>, String), String> {
        let packages_path = self.get_addin_packages_path().await?;

        let addin_package_dir = packages_path.join(&package.display_name);
        let image_path = addin_package_dir.join(&package.relative_path_to_image);

        // Determine MIME type based on file extension
        let mime_type = match image_path.extension().and_then(|ext| ext.to_str()) {
            Some("jpg") | Some("jpeg") => "image/jpeg",
            Some("png") => "image/png",
            _ => {
                return Err("Unsupported image format. Only JPEG and PNG are supported.".to_string())
            }
        };

        let image_data = fs::read(image_path).map_err(|e| e.to_string())?;
        Ok((image_data, mime_type.to_string()))
    }

    pub async fn open_help_file_for_package(
        &self,
        package: &AddinPackageInfoModel,
    ) -> Result<(), String> {
        // Check if package has a help file
        let help_file_path = match &package.relative_path_to_help_file {
            Some(relative_path) => relative_path,
            None => return Err("No help file specified for this package".to_string()),
        };

        // Get the app data directory path
        let appdata_path = self.app_save_service.get_save_path();

        // Create the help files directory in app data
        let help_files_dir = appdata_path.join("HelpFiles");
        std::fs::create_dir_all(&help_files_dir)
            .map_err(|e| format!("Failed to create help files directory: {}", e))?;

        // Construct the source path from the AddinPackages directory
        let packages_path = self.get_addin_packages_path().await?;
        let package_dir = packages_path.join(&package.display_name);
        let source_path = package_dir.join(help_file_path);

        // Check if source file exists
        if !source_path.exists() {
            return Err(format!("Help file not found at: {}", source_path.display()));
        }

        // Create destination path in app data
        let dest_filename = format!(
            "{}_{}",
            package.display_name.replace(" ", "_"),
            help_file_path
        );
        let dest_path = help_files_dir.join(dest_filename);

        // Copy the file to app data directory
        std::fs::copy(&source_path, &dest_path)
            .map_err(|e| format!("Failed to copy help file: {}", e))?;

        // Open the file with the default application (usually Microsoft Word for .docx files)
        // Use 'cmd /c start' to leverage Windows file associations
        let status = std::process::Command::new("cmd")
            .creation_flags(CREATE_NO_WINDOW)
            .args(["/c", "start", "", &dest_path.to_string_lossy()])
            .status()
            .map_err(|e| format!("Failed to open file: {}", e))?;

        if !status.success() {
            return Err(
                "Failed to open file. Please ensure you have Microsoft Word installed.".to_string(),
            );
        }

        Ok(())
    }
}
