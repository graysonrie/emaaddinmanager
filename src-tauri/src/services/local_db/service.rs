use std::sync::Arc;

use crate::services::app_save::service::AppSaveService;

use super::tables::app_kv_store::api::AppKvStoreTable;
use sea_orm::{ConnectionTrait, DatabaseConnection, Statement};
use sqlx::sqlite::SqlitePool;
use tauri::AppHandle;

pub struct LocalDbService {
    connection: Arc<DatabaseConnection>,
    kv_store_table: AppKvStoreTable,
}

impl LocalDbService {
    // consider using a config here
    pub async fn new_async(save_service: &AppSaveService, app_handle: AppHandle) -> Self {
        let db_path = save_service.create_path("file_index.db");
        let db_url = format!("sqlite://{}", db_path.to_string_lossy());

        // Starts out as a SQLX pool, but 'into' is called to turn it into a Sea ORM database connection
        let db: Arc<DatabaseConnection> =
            Arc::new(SqlitePool::connect(&db_url).await.unwrap().into());

        // initialize the tables
        let kv_store_table = AppKvStoreTable::new_async(db.clone(), app_handle).await;

        Self {
            connection: db,
            kv_store_table,
        }
    }

    pub fn kv_store_table(&self) -> &AppKvStoreTable {
        &self.kv_store_table
    }
}
