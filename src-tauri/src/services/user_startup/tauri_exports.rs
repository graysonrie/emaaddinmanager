use std::path::Path;
use std::sync::Arc;

use tauri::State;

use crate::constants::ADDINS_REGISTRY_PATH;
use crate::services::local_db::service::LocalDbService;
use crate::services::user_stats::db::client::StatsApiClient;

#[tauri::command]
pub async fn ensure_connected_to_server(
    local_db: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    let registry_path = Path::new(ADDINS_REGISTRY_PATH);
    if !registry_path.exists() {
        return Err("Registry path does not exist".to_string());
    }

    // Verify the stats server is reachable.
    StatsApiClient::new(local_db.inner().clone())
        .ping()
        .await?;

    Ok(())
}
