use std::fmt::Display;
use tauri::AppHandle;
use tokio::task::JoinHandle;

use crate::services::{
    addin_updater::{update_checker},
    addins_registry::services::AsyncAddinsRegistryServiceType,
};

#[derive(Debug)]
pub enum CheckForUpdatesError {
    Registry(String),
    LocalAddins(String),
    Update(String),
    RevitRunning(String),
}
impl Display for CheckForUpdatesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

/// A service to manage the background update checker.
pub struct AddinUpdaterService {
    pub addins_registry: AsyncAddinsRegistryServiceType,
    update_checker_task: JoinHandle<()>,
}

impl AddinUpdaterService {
    pub fn new(addins_registry: AsyncAddinsRegistryServiceType, app_handle: AppHandle) -> Self {
        let update_checker_task = update_checker::spawn_update_checker(app_handle, addins_registry.clone());
        Self {
            addins_registry,
            update_checker_task,
        }
    }
}
