use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::time::sleep;
use tokio::{sync::Mutex, task::JoinHandle};

use crate::services::admin::service::AdminService;
use crate::services::{
    addin_updater::update_checker::allowed_addins_manager::AllowedAddinsManager,
    local_db::service::LocalDbService, user_stats::LocalUserStatsService,
};

mod allowed_addins_manager;
mod helpers;
mod notifications;
mod pending_updates;
mod types;
pub use types::*;

use crate::services::{
    addin_updater::models::UpdateNotificationModel,
    addins_registry::{models::addin_model::AddinModel, services::AsyncAddinsRegistryServiceType},
    local_addins::service::LocalAddinsService,
};

pub enum UpdateResult {
    Updated,
    RevitIsOpen,
    NoUpdatesAvailable,
}

pub struct AddinUpdateChecker {
    app_handle: AppHandle,
    addins_registry: AsyncAddinsRegistryServiceType,
    pending_updates_state: PendingUpdatesStateType,
    allowed_addins_manager: AllowedAddinsManager,
    admin_service: Arc<AdminService>,
}

impl AddinUpdateChecker {
    pub fn new(
        app_handle: AppHandle,
        addins_registry: AsyncAddinsRegistryServiceType,
        user_stats: Arc<LocalUserStatsService>,
        db: Arc<LocalDbService>,
        admin_service: Arc<AdminService>,
    ) -> Self {
        let allowed_addins_manager =
            AllowedAddinsManager::new(app_handle.clone(), user_stats, db, addins_registry.clone());
        let pending_updates_state = Arc::new(Mutex::new(PendingUpdatesState::default()));
        app_handle.manage(pending_updates_state.clone());
        Self {
            app_handle,
            addins_registry,
            pending_updates_state,
            allowed_addins_manager,
            admin_service,
        }
    }
    /// Spawns the background update checker loop and manages the shared state
    pub fn spawn_update_checker(&self) -> JoinHandle<()> {
        let app_handle = self.app_handle.clone();
        let addins_registry = self.addins_registry.clone();
        let pending_updates_state = self.pending_updates_state.clone();
        let allowed_addins_manager = self.allowed_addins_manager.clone();
        let admin_service = self.admin_service.clone();
        tokio::spawn(async move {
            AddinUpdateChecker {
                app_handle,
                addins_registry,
                pending_updates_state,
                allowed_addins_manager,
                admin_service,
            }
            .update_checker_loop()
            .await;
        })
    }

    /// Checks for updates, applies them if possible, and manages pending updates
    ///
    /// TODO: if one install fails, the whole thing fails. Consider just emitting notifications for errors
    async fn check_and_apply_updates(&self) -> Result<UpdateResult, String> {
        let addins = self
            .addins_registry
            .get_addins()
            .await
            .map_err(|e| format!("Registry error: {}", e))?;
        let current_local_addins = LocalAddinsService::get_local_addins()
            .map_err(|e| format!("Local addins error: {}", e))?;
        let addins_needing_updates =
            Self::detect_addins_needing_update(&addins, &current_local_addins)?;

        // Only check for addins needing installs if the user is NOT an admin:
        let mut addins_needing_installs = Vec::new();
        if !self.admin_service.is_admin().await {
            addins_needing_installs = self
                .allowed_addins_manager
                .run_check()
                .await
                .map_err(|e| e.to_string())?;
        }
        // ! Debug print:
        println!("Addins needing installs: {}", addins_needing_installs.len());

        if addins_needing_updates.is_empty() && addins_needing_installs.is_empty() {
            pending_updates::clear_pending_updates(&self.pending_updates_state).await;
            return Ok(UpdateResult::NoUpdatesAvailable);
        }
        let revit_is_running = revit_check::is_revit_running()
            .await
            .map_err(|e| e.to_string())?;
        if revit_is_running {
            // Dont apply updates yet, store them for later
            // This is to avoid applying updates while Revit is running, which can cause issues
            // with the addin not being able to load.
            pending_updates::store_pending_updates(
                &self.pending_updates_state,
                &addins_needing_updates,
            )
            .await;
            notifications::with(&self.app_handle).install_addin_pending(&addins_needing_installs);
            // notifications::with(&self.app_handle).pending_update(&addins_needing_updates);
            return Ok(UpdateResult::RevitIsOpen);
        }
        Self::apply_updates(addins_needing_updates).await;
        // Apply all of the installs:
        for install in addins_needing_installs.iter() {
            install.execute().await.map_err(|e| e.to_string())?;
        }

        pending_updates::clear_pending_updates(&self.pending_updates_state).await;
        Ok(UpdateResult::Updated)
    }

    /// The main background update checker loop
    pub async fn update_checker_loop(self) {
        loop {
            match self.check_and_apply_updates().await {
                Ok(notifications) => {}
                Err(e) => {
                    eprintln!("Error checking for updates: {}", e);
                }
            }
            // Try to apply pending updates if Revit is now closed
            if let Err(e) = pending_updates::try_apply_pending_updates(
                &self.addins_registry,
                &self.pending_updates_state,
                &self.app_handle,
            )
            .await
            {
                eprintln!("Error applying pending updates: {}", e);
            }
            sleep(Duration::from_secs(60)).await;
        }
    }

    /// Manually trigger a check for updates (used by Tauri command)
    pub async fn manual_check_for_updates(&self) -> Result<UpdateResult, String> {
        println!("Manual update check triggered");
        let update_result = self.check_and_apply_updates().await?;
        if let UpdateResult::NoUpdatesAvailable = update_result {
            notifications::with(&self.app_handle).emit_no_updates();
        }
        Ok(update_result)
    }

    /// Returns a list of (registry_addin, local_addin) pairs that need updating
    fn detect_addins_needing_update(
        addins: &[AddinModel],
        current_local_addins: &[AddinModel],
    ) -> Result<Vec<AddinNeedingUpdate>, String> {
        let mut needing_update = Vec::new();
        for current_local_addin in current_local_addins {
            let current_local_addin_dll_name =
                helpers::get_addin_dll_folder_name(current_local_addin)
                    .map_err(|e| format!("Failed to get local addin DLL folder name: {}", e))?;
            if let Some(corresponding_registry_addin) = addins.iter().find(|addin| {
                let registry_addin_dll_name =
                    helpers::get_addin_dll_folder_name(addin).unwrap_or_else(|_| String::new());
                registry_addin_dll_name == current_local_addin_dll_name
            }) {
                let registry_addin_dll_modification_time =
                    helpers::get_addin_dll_modification_time(corresponding_registry_addin)
                        .map_err(|e| {
                            format!("Failed to get registry addin modification time: {}", e)
                        })?;
                let current_local_addin_dll_modification_time =
                    helpers::get_addin_dll_modification_time(current_local_addin).map_err(|e| {
                        format!("Failed to get local addin modification time: {}", e)
                    })?;
                if registry_addin_dll_modification_time > current_local_addin_dll_modification_time
                {
                    needing_update.push(AddinNeedingUpdate {
                        registry_addin: corresponding_registry_addin.clone(),
                        local_addin: current_local_addin.clone(),
                    });
                }
            }
        }
        Ok(needing_update)
    }

    /// Applies updates for all addins that need them
    async fn apply_updates(
        addins_needing_updates: Vec<AddinNeedingUpdate>,
    ) -> Vec<UpdateNotificationModel> {
        let mut notifications = Vec::new();
        for addin_needing_update in addins_needing_updates {
            let registry_addin = addin_needing_update.registry_addin;
            let local_addin = addin_needing_update.local_addin;
            println!("Updating addin: {}", local_addin.name);
            match helpers::install_addin(&registry_addin, &local_addin) {
                Ok(update_notification) => notifications.push(update_notification),
                Err(e) => {
                    eprintln!("Failed to update addin {}: {:?}", local_addin.name, e);
                }
            }
        }
        notifications
    }
}
