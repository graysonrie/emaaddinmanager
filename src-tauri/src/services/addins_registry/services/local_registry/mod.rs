use std::{fs, path::Path, sync::Arc};

use super::*;
use log::{error, info};
mod helpers;
use helpers::*;

use crate::{
    constants::Fut,
    models::kv_store_value::KvStoreValue,
    services::{
        addins_registry::{models::addin_model::AddinModel, services::AddinsRegistry},
        admin::addin_exporter::models::category_model::CategoryModel,
        config::keys::LOCAL_ADDIN_REGISTRY_PATH,
        local_addins::service::LocalAddinsService,
        local_db::service::LocalDbService,
    },
};

pub struct LocalAddinsRegistryService {
    registry_location: KvStoreValue<String>,
}

impl LocalAddinsRegistryService {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self {
            registry_location: KvStoreValue::new_default(
                LOCAL_ADDIN_REGISTRY_PATH,
                local_db.clone(),
            ),
        }
    }
}

impl AddinsRegistry for LocalAddinsRegistryService {
    fn get_addins(&self) -> Fut<Result<Vec<AddinModel>, GetAddinsError>> {
        Box::pin(async move {
            let dir_path = self
                .registry_location
                .get_data_updated()
                .await
                .map_err(GetAddinsError::LocalDbError)?;

            if dir_path.is_empty() {
                return Err(GetAddinsError::RegistryNotFound(
                    "Registry path is empty".to_string(),
                ));
            }

            let mut addins = Vec::new();
            let path = Path::new(&dir_path);

            if !path.exists() {
                return Err(GetAddinsError::RegistryNotFound(dir_path));
            }

            if !path.is_dir() {
                return Err(GetAddinsError::InvalidPath);
            }

            info!("Searching for addins in: {}", dir_path);

            if let Err(e) = search_directory_recursively(path, &mut addins) {
                error!("Error searching directory {}: {}", dir_path, e);
            }

            info!("Found {} addins in {}", addins.len(), dir_path);
            Ok(addins)
        })
    }

    fn install_addin(
        &self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Fut<Result<(), super::InstallAddinError>> {
        Box::pin(async move {
            LocalAddinsService::install_addin(&addin, &for_revit_versions)
                .map_err(|e| InstallAddinError::InstallationError(e.to_string()))?;
            Ok(())
        })
    }

    fn delist_addin(&self, addin: AddinModel) -> Fut<Result<(), DelistAddinError>> {
        Box::pin(async move {
            let registry_path = self
                .registry_location
                .get_data_updated()
                .await
                .map_err(DelistAddinError::LocalDbError)?;

            fn recurse_dir(dir: &Path, addin: &AddinModel) -> Result<bool, DelistAddinError> {
                let entries = fs::read_dir(dir)
                    .map_err(|e| DelistAddinError::DirectoryRecursionError(e.to_string()))?;
                for entry in entries {
                    let entry = entry
                        .map_err(|e| DelistAddinError::DirectoryRecursionError(e.to_string()))?;
                    let entry_path = entry.path();
                    if entry_path.is_dir() {
                        // Recurse into subdirectory
                        if recurse_dir(&entry_path, addin)? {
                            return Ok(true);
                        }
                    } else if entry_path.is_file() {
                        if let Some(ext) = entry_path.extension() {
                            if ext == "addin" {
                                let addin_info = revitcli::get_addin_file_info_from_file(
                                    entry_path.to_str().unwrap(),
                                )
                                .map_err(|e| {
                                    DelistAddinError::DirectoryRecursionError(e.to_string())
                                })?;
                                if addin_info.addin_id == addin.addin_id {
                                    // Remove the .addin file
                                    fs::remove_file(&entry_path).map_err(|e| {
                                        DelistAddinError::DirectoryRecursionError(e.to_string())
                                    })?;
                                    // Remove the DLL folder
                                    let dll_folder = entry_path.with_extension("");
                                    fs::remove_dir_all(&dll_folder).map_err(|e| {
                                        DelistAddinError::DirectoryRecursionError(e.to_string())
                                    })?;
                                    return Ok(true);
                                }
                            }
                        }
                    }
                }
                Ok(false)
            }
            let registry_path = Path::new(&registry_path);
            recurse_dir(registry_path, &addin)?;
            Ok(())
        })
    }

    fn add_category(&self, full_category_path: &str) -> Fut<Result<(), AddCategoryError>> {
        let full_category_path = full_category_path.to_owned();
        Box::pin(async move {
            let registry_path = self
                .registry_location
                .get_data_updated()
                .await
                .map_err(AddCategoryError::LocalDbError)?;

            // Convert paths to Path objects for easier manipulation
            let category_path = Path::new(&full_category_path);
            let registry_path_obj = Path::new(&registry_path);

            // Ensure the registry path exists and is a directory
            if !registry_path_obj.exists() || !registry_path_obj.is_dir() {
                return Err(AddCategoryError::RegistryNotFound(registry_path));
            }

            // Check if the category path is inside the registry path (security check)
            if !category_path.starts_with(registry_path_obj) {
                return Err(AddCategoryError::CategoryNotInsideRegistry);
            }

            // Create the category directory if it doesn't exist
            if !category_path.exists() {
                fs::create_dir_all(category_path).map_err(AddCategoryError::FileError)?;
                info!("Created category directory: {}", full_category_path);
            } else if !category_path.is_dir() {
                return Err(AddCategoryError::InvalidPath);
            }

            Ok(())
        })
    }

    fn get_categories(&self) -> Fut<Result<Vec<CategoryModel>, GetCategoriesError>> {
        Box::pin(async move {
            let registry_path = self
                .registry_location
                .get_data_updated()
                .await
                .map_err(GetCategoriesError::LocalDbError)?;

            let mut categories = Vec::new();
            scan_categories_recursively(Path::new(&registry_path), &mut categories)
                .map_err(GetCategoriesError::FileError)?;
            Ok(categories)
        })
    }
}
