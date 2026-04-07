use std::sync::Arc;

use crate::services::app_save::service::AppSaveService;

use super::tables::app_kv_store::api::AppKvStoreTable;
use sea_orm::DatabaseConnection;
use sqlx::sqlite::SqlitePoolOptions;
use tauri::AppHandle;
use std::time::Duration;

pub struct LocalDbService {
    kv_store_table: AppKvStoreTable,
}

impl LocalDbService {
    // consider using a config here
    pub async fn new_async(save_service: &AppSaveService, app_handle: AppHandle) -> Result<Self, String> {
        let db_path = save_service.create_path("file_index.db");
        let db_url = format!("sqlite://{}", db_path.to_string_lossy());

        // Starts out as a SQLX pool, but 'into' is called to turn it into a Sea ORM database connection
        let pool = SqlitePoolOptions::new()
            .max_connections(10)
            .acquire_timeout(Duration::from_secs(10))
            .connect(&db_url)
            .await
            .map_err(|e| e.to_string())?;
        let db: Arc<DatabaseConnection> = Arc::new(pool.into());

        // initialize the tables
        let kv_store_table = AppKvStoreTable::new_async(db.clone(), app_handle).await?;

        Ok(Self { kv_store_table })
    }

    pub fn kv_store_table(&self) -> &AppKvStoreTable {
        &self.kv_store_table
    }
}
