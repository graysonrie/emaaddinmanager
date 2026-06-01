use std::path::Path;

use crate::constants::ADDINS_REGISTRY_PATH;
use crate::services::user_stats::db::client::StatsApiClient;

#[tauri::command]
pub async fn ensure_connected_to_server() -> Result<(), String> {
    let registry_path = Path::new(ADDINS_REGISTRY_PATH);
    if !registry_path.exists() {
        return Err("Registry path does not exist".to_string());
    }

    // Verify the stats server is reachable.
    StatsApiClient::new().health().await?;

    Ok(())
}
