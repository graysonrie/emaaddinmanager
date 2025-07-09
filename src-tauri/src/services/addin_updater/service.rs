use std::{fmt::Display, fs, path::Path};

use chrono::{DateTime, Utc};

use crate::services::{
    addin_updater::models::UpdateNotificationModel,
    addins_registry::{models::addin_model::AddinModel, services::AsyncAddinsRegistryServiceType},
    local_addins::service::LocalAddinsService,
};

#[derive(Debug)]
pub enum CheckForUpdatesError {
    Registry(String),
    LocalAddins(String),
    Update(String),
}
impl Display for CheckForUpdatesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
pub struct AddinUpdaterService {
    pub addins_registry: AsyncAddinsRegistryServiceType,
}

impl AddinUpdaterService {
    pub fn new(addins_registry: AsyncAddinsRegistryServiceType) -> Self {
        Self { addins_registry }
    }

    /// Check for updates for all local addins.
    /// If an update is found, apply it and return a notification model.
    pub async fn check_for_updates(
        &self,
    ) -> Result<Vec<UpdateNotificationModel>, CheckForUpdatesError> {
        let mut update_notifications = Vec::new();

        let addins = self
            .addins_registry
            .get_addins()
            .await
            .map_err(|e| CheckForUpdatesError::Registry(e.to_string()))?;

        let current_local_addins = LocalAddinsService::get_local_addins()
            .map_err(|e| CheckForUpdatesError::LocalAddins(e.to_string()))?;

        // For each local addin, check if their DLL file has been modified earlier than the registry addin's DLL file
        for current_local_addin in current_local_addins.iter() {
            if let Some(corresponding_registry_addin) = addins.iter().find(|addin| {
                addin.name == current_local_addin.name
                    && addin.vendor == current_local_addin.vendor
                    && addin.addin_type == current_local_addin.addin_type
            }) {
                let registry_addin_dll_modification_time =
                    Self::get_addin_dll_modification_time(corresponding_registry_addin)?;
                let current_local_addin_dll_modification_time =
                    Self::get_addin_dll_modification_time(current_local_addin)?;
                if registry_addin_dll_modification_time > current_local_addin_dll_modification_time
                {
                    println!("Update found for addin: {}", current_local_addin.name);
                    // Apply the update:
                    let update_notification =
                        Self::update_addin(corresponding_registry_addin, current_local_addin)?;
                    update_notifications.push(update_notification);
                }
            }
        }

        Ok(update_notifications)
    }

    fn update_addin(
        up_to_date_addin: &AddinModel,
        current_addin: &AddinModel,
    ) -> Result<UpdateNotificationModel, CheckForUpdatesError> {
        // Copy DLL files from registry addin to local addin
        Self::copy_dll_files(up_to_date_addin, current_addin)?;

        // Copy XML file from registry addin to local addin
        Self::copy_xml_file(up_to_date_addin, current_addin)?;

        // Return the update notification model
        Ok(UpdateNotificationModel {
            addin_name: current_addin.name.clone(),
            addin_vendor_id: current_addin.vendor.clone(),
            addin_vendor_email: current_addin.email.clone(),
        })
    }

    fn copy_dll_files(
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

        if !target_dll_folder.exists() {
            return Err(CheckForUpdatesError::Update(format!(
                "Target DLL folder does not exist: {}",
                target_dll_folder.display()
            )));
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

        Ok(())
    }

    fn copy_xml_file(
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

    fn get_addin_dll_modification_time(
        addin: &AddinModel,
    ) -> Result<DateTime<Utc>, CheckForUpdatesError> {
        let registry_addin_dll_folder_path = Path::new(&addin.path_to_addin_dll_folder);
        let dll_folder_name = Self::get_addin_dll_folder_name(addin);
        let dll_path = registry_addin_dll_folder_path.join(format!("{}.dll", dll_folder_name));
        let registry_addin_dll_modification_time =
            fs::metadata(dll_path).unwrap().modified().unwrap();
        Ok(registry_addin_dll_modification_time.into())
    }

    fn get_addin_dll_folder_name(addin: &AddinModel) -> String {
        let registry_addin_dll_folder_path = Path::new(&addin.path_to_addin_dll_folder);
        let dll_folder_name = registry_addin_dll_folder_path
            .file_name()
            .unwrap()
            .to_str()
            .unwrap();
        dll_folder_name.to_string()
    }
}
