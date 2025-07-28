use std::sync::Arc;
use tokio::sync::Mutex;

use crate::services::addins_registry::models::addin_model::AddinModel;

/// Type alias for the shared pending updates state
pub type PendingUpdatesStateType = Arc<Mutex<PendingUpdatesState>>;

/// Thread-safe state for tracking pending updates
#[derive(Default)]
pub struct PendingUpdatesState {
    pub pending_updates: Option<Vec<AddinNeedingUpdatePaths>>,
}

/// A struct representing an addin that needs to be updated
pub struct AddinNeedingUpdate {
    pub registry_addin: AddinModel,
    pub local_addin: AddinModel,
}

/// A struct representing the paths of an addin that needs to be updated
pub struct AddinNeedingUpdatePaths {
    pub registry_addin_path: String,
    pub local_addin_path: String,
}