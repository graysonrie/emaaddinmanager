use std::path::Path;

use crate::constants::ADDINS_REGISTRY_PATH;

#[tauri::command]
pub async fn ensure_connected_to_server() -> Result<(), String> {
    let registry_path = Path::new(ADDINS_REGISTRY_PATH);
    if !registry_path.exists() {
        return Err("Registry path does not exist".to_string());
    }
    Ok(())
}
