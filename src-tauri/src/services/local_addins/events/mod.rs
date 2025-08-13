use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddinInstallProgressEvent {
    /// Where 100 indicates complete and less than that means not complete
    pub progress: i32,
    pub addin_name: String,
    pub description: String,
}
/// Emits an event to the frontend detailing the progress of an addin being installed / updated
pub fn emit_progress_event(app: AppHandle, event: AddinInstallProgressEvent) -> tauri::Result<()> {
    app.emit("addin_install_progress", event)
}
