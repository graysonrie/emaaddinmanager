use std::{fs, path::Path, sync::Arc};

use sea_orm::{ConnectionTrait, DatabaseConnection};
use sqlx::sqlite::SqlitePool;
pub mod api;
pub mod entities;
use api::UserStatsTable;
pub use entities::*;

pub struct LocalStatsDbHandler {
    pub user_stats_table: UserStatsTable,
}

impl LocalStatsDbHandler {
    /// Creates a new instance of the local stats database handler.
    ///
    /// `dir` is the directory where the database will be stored.
    /// It will create the directory if it doesn't exist.
    /// It will create the database file if it doesn't exist.
    pub async fn new_async(dir: &Path) -> Self {
        let path_to_db = dir.join("UserStats.db");
        if !path_to_db.exists() {
            fs::create_dir_all(dir).unwrap();
            fs::File::create(&path_to_db).unwrap();
        }
        let db_url = format!("sqlite://{}", path_to_db.to_string_lossy());
        let db: Arc<DatabaseConnection> =
            Arc::new(SqlitePool::connect(&db_url).await.unwrap().into());
        let user_stats_table = UserStatsTable::new_async(db).await;
        Self { user_stats_table }
    }
}
