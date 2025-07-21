use std::{fs, path::Path, sync::Arc};

use sea_orm::DatabaseConnection;
use sqlx::sqlite::SqlitePool;
pub mod user_addins;
pub mod user_stats;
use user_addins::UserAddinsTable;
use user_stats::UserStatsTable;

pub struct LocalStatsDbHandler {
    user_stats_table: UserStatsTable,
    user_addins_table: UserAddinsTable,
}

impl LocalStatsDbHandler {
    /// Creates a new instance of the local stats database handler.
    ///
    /// `dir` is the directory where the database will be stored.
    /// It will NOT create the directory if it doesn't exist.
    /// It will NOT create the database file if it doesn't exist.
    pub async fn new_async(dir: &Path) -> Self {
        // Removed code that created DB if the file didn't exist
        let path_to_db = dir.join("UserStats.db");

        let db_url = format!("sqlite://{}", path_to_db.to_string_lossy());
        let db: Arc<DatabaseConnection> =
            Arc::new(SqlitePool::connect(&db_url).await.unwrap().into());
        let user_stats_table = UserStatsTable::new_async(db.clone()).await;
        let user_addins_table = UserAddinsTable::new_async(db.clone()).await;
        Self {
            user_stats_table,
            user_addins_table,
        }
    }

    pub fn user_stats_table(&self) -> &UserStatsTable {
        &self.user_stats_table
    }

    pub fn user_addins_table(&self) -> &UserAddinsTable {
        &self.user_addins_table
    }
}
