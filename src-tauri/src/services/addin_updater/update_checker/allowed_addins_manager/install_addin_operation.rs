use tauri::AppHandle;

use crate::services::{
    addin_updater::update_checker::{allowed_addins_manager::UpdateCheckError, notifications},
    addins_registry::{models::addin_model::AddinModel, services::AsyncAddinsRegistryServiceType},
};

pub enum Operation {
    Install,
}

pub struct InstallAddinOperation {
    pub operation: Operation,
    pub addin: AddinModel,
    for_revit_versions: Vec<String>,
    app_handle: AppHandle,
    addin_registry: AsyncAddinsRegistryServiceType,
}

impl InstallAddinOperation {
    pub fn new_install(
        addin: AddinModel,
        for_revit_versions: Vec<String>,
        app_handle: AppHandle,
        addin_registry: AsyncAddinsRegistryServiceType,
    ) -> Self {
        Self {
            operation: Operation::Install,
            addin,
            for_revit_versions,
            app_handle,
            addin_registry,
        }
    }
    /// Automatically emits a notification to the frontend once it is installed
    pub async fn execute(&self) -> Result<(), UpdateCheckError> {
        let registry_addin = self.addin.clone();
        let for_revit_versions = self.for_revit_versions.clone();
        self.addin_registry
            .install_addin(registry_addin.clone(), for_revit_versions)
            .await
            .map_err(|e| UpdateCheckError::AddinsRegistry(e.to_string()))?;
        // Emit a notification to the frontend that the addin is now available
        notifications::with(&self.app_handle).allowed_addin_installed(&registry_addin);
        Ok(())
    }

}
