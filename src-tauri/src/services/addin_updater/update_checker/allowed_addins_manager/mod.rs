use std::{fmt::Display, sync::Arc};

use tauri::AppHandle;

use crate::{
    services::{
        addins_registry::{
            models::addin_model::AddinModel, services::AsyncAddinsRegistryServiceType,
        },
        config::keys,
        local_addins::service::LocalAddinsService,
        local_db::service::LocalDbService,
        user_stats::{db::user_addins::UserAddinsError, LocalUserStatsService},
    },
    utils,
};
mod install_addin_operation;
pub use install_addin_operation::*;

pub const ALL_REVIT_VERSIONS: [&str; 7] = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];

#[derive(Debug)]
pub enum UpdateCheckError {
    GetUserEmail(String),
    UserAddinsTable(UserAddinsError),
    UserNotFound,
    Deserialization(serde_json::Error),
    AddinsRegistry(String),
    LocalAddins(String),
}
impl Display for UpdateCheckError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

/// All data wraps an Arc and can be cloned
#[derive(Clone)]
pub struct AllowedAddinsManager {
    app_handle: AppHandle,
    user_stats: Arc<LocalUserStatsService>,
    db: Arc<LocalDbService>,
    addin_registry: AsyncAddinsRegistryServiceType,
}

impl AllowedAddinsManager {
    pub fn new(
        app_handle: AppHandle,
        user_stats: Arc<LocalUserStatsService>,
        db: Arc<LocalDbService>,
        addin_registry: AsyncAddinsRegistryServiceType,
    ) -> Self {
        Self {
            app_handle,
            user_stats,
            db,
            addin_registry,
        }
    }
    /// Runs the check and returns a vector of operations to be executed ideally when Revit is closed
    pub async fn run_check(&self) -> Result<Vec<InstallAddinOperation>, UpdateCheckError> {
        let mut operations = vec![];
        let user_email = keys::get_user_email(self.db.clone())
            .await
            .map_err(UpdateCheckError::GetUserEmail)?;

        let user_addins_table = self.user_stats.stats_db.user_addins_table();

        let user = user_addins_table
            .get_user(user_email)
            .await
            .map_err(UpdateCheckError::UserAddinsTable)?;
        match user {
            Some(user) => {
                let allowed_addin_paths: Vec<String> =
                    serde_json::from_value(user.allowed_addin_paths)
                        .map_err(UpdateCheckError::Deserialization)?;
                for allowed_addin in allowed_addin_paths.iter() {
                    let registry_addin = self
                        .fetch_corresponding_registry_addin(allowed_addin)
                        .await?;
                    if let Some(registry_addin) = registry_addin {
                        let is_already_installed =
                            LocalAddinsService::is_addin_installed_locally_model(&registry_addin)
                                .map_err(|e| UpdateCheckError::LocalAddins(e.to_string()))?;

                        // Only try to install the addin if it is not already installed
                        if !is_already_installed {
                            let for_revit_versions =
                                Self::determine_revit_versions_for_addin(allowed_addin);
                            operations.push(InstallAddinOperation::new_install(
                                registry_addin,
                                for_revit_versions,
                                self.app_handle.clone(),
                                self.addin_registry.clone(),
                            ));
                        }
                    } else {
                        println!(
                            "WARNING: could not find corresponding registry addin for {:?}",
                            allowed_addin
                        )
                    }
                }
            }
            None => return Err(UpdateCheckError::UserNotFound),
        }

        Ok(operations)
    }

    async fn fetch_registry_addins(&self) -> Result<Vec<AddinModel>, UpdateCheckError> {
        self.addin_registry
            .get_addins()
            .await
            .map_err(|e| UpdateCheckError::AddinsRegistry(e.to_string()))
    }

    async fn fetch_corresponding_registry_addin(
        &self,
        addin_path: &str,
    ) -> Result<Option<AddinModel>, UpdateCheckError> {
        let registry_addins = self.fetch_registry_addins().await?;

        Ok(registry_addins
            .iter()
            .find(|addin| {
                let converted_dll_folder = utils::double_backslash_to_single_forward_slash(
                    &addin.path_to_addin_dll_folder,
                );
                converted_dll_folder.contains(addin_path)
            })
            .cloned())
    }

    fn determine_revit_versions_for_addin(addin_path: &str) -> Vec<String> {
        let path_str = addin_path;

        // Look for first year in path that matches a Revit version
        for year in ALL_REVIT_VERSIONS.iter() {
            if path_str.contains(year) {
                return vec![year.to_string()];
            }
        }

        // If no year found, return all versions
        ALL_REVIT_VERSIONS.iter().map(|v| v.to_string()).collect()
    }
}
