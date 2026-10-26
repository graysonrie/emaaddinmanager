use std::path::Path;
use std::sync::Arc;

use serde::Deserialize;
use tauri::State;

use crate::constants::ADDINS_REGISTRY_PATH;
use crate::services::config::keys;
use crate::services::local_db::service::LocalDbService;
use crate::services::user_stats::db::client::StatsApiClient;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ServerSession {
    user_email: String,
    name: Option<String>,
}

#[tauri::command]
pub async fn ensure_connected_to_server(
    local_db: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    let registry_path = Path::new(ADDINS_REGISTRY_PATH);
    if !registry_path.exists() {
        return Err("Registry path does not exist".to_string());
    }

    let db = local_db.inner().clone();
    let client = StatsApiClient::new(db.clone());
    client.ping().await?;
    let session: ServerSession = client.get("/session").await?;
    remember_account(db, &session).await
}

async fn remember_account(
    local_db: Arc<LocalDbService>,
    session: &ServerSession,
) -> Result<(), String> {
    local_db
        .kv_store_table()
        .set(keys::USER_EMAIL.to_string(), session.user_email.clone())
        .await?;
    let current_name = keys::get_user_name(local_db.clone()).await.unwrap_or_default();
    if current_name.trim().is_empty() {
        if let Some(name) = session
            .name
            .as_deref()
            .map(str::trim)
            .filter(|name| !name.is_empty())
        {
            local_db
                .kv_store_table()
                .set(keys::USER_NAME.to_string(), name.to_string())
                .await?;
        }
    }
    Ok(())
}
