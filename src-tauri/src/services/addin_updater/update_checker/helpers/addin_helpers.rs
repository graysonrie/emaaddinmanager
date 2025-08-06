use crate::services::{
    addin_updater::{
        models::{UpdateNotificationModel, UpdateNotificationType},
        service::CheckForUpdatesError,
        update_checker::helpers,
    },
    addins_registry::models::addin_model::AddinModel,
};

/// Install or update an addin by copying files from a registry addin to a local addin.
/// This function can be used for both fresh installations and updates.
/// If the target addin doesn't exist, it will be created.
pub fn install_addin(
    up_to_date_addin: &AddinModel,
    current_addin: &AddinModel,
) -> Result<UpdateNotificationModel, CheckForUpdatesError> {
    // Copy DLL files from registry addin to local addin
    // !Updated to prefer copying all files instead of just DLLs
    helpers::copy_all_files(up_to_date_addin, current_addin)?;

    // Copy XML file from registry addin to local addin
    helpers::copy_xml_file(up_to_date_addin, current_addin)?;

    // Return the update notification model
    Ok(UpdateNotificationModel {
        title: format!("Updated {}", current_addin.name),
        description: "The addin has been updated to the latest version".to_string(),
        notification_type: UpdateNotificationType::Install,
    })
}
