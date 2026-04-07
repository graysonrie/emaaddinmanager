use std::{path::Path, sync::Arc};

use sea_orm::{ConnectionTrait, DatabaseBackend, DatabaseConnection, Statement, TransactionTrait};
use sqlx::sqlite::SqlitePoolOptions;
use std::time::Duration;
pub mod login_info;
pub mod user_addins;
pub mod user_metadata;
pub mod user_stats;
use user_addins::UserAddinsTable;
use user_metadata::UserMetadataTable;
use user_stats::UserStatsTable;

use crate::services::user_stats::db::login_info::LoginInfoTable;

pub struct LocalStatsDbHandler {
    db: Arc<DatabaseConnection>,
    user_stats_table: UserStatsTable,
    user_addins_table: UserAddinsTable,
    user_metadata_table: UserMetadataTable,
    login_info_table: LoginInfoTable,
}

impl LocalStatsDbHandler {
    /// Creates a new instance of the local stats database handler.
    ///
    /// `dir` is the directory where the database will be stored.
    /// It will NOT create the directory if it doesn't exist.
    /// It will NOT create the database file if it doesn't exist.
    pub async fn new_async(dir: &Path) -> Result<Self, String> {
        // Removed code that created DB if the file didn't exist
        let path_to_db = dir.join("UserStats2.db");

        let db_url = format!("sqlite://{}", path_to_db.to_string_lossy());
        let pool = SqlitePoolOptions::new()
            .max_connections(10)
            .acquire_timeout(Duration::from_secs(10))
            .connect(&db_url)
            .await
            .map_err(|e| e.to_string())?;
        let db: Arc<DatabaseConnection> = Arc::new(pool.into());
        let user_stats_table = UserStatsTable::new_async(db.clone()).await;
        let user_addins_table = UserAddinsTable::new_async(db.clone()).await;
        let user_metadata_table = UserMetadataTable::new_async(db.clone()).await;
        let login_info_table = LoginInfoTable::new_async(db.clone());
        Ok(Self {
            db,
            user_stats_table,
            user_addins_table,
            user_metadata_table,
            login_info_table,
        })
    }

    pub fn user_stats_table(&self) -> &UserStatsTable {
        &self.user_stats_table
    }

    pub fn user_addins_table(&self) -> &UserAddinsTable {
        &self.user_addins_table
    }

    pub fn user_metadata_table(&self) -> &UserMetadataTable {
        &self.user_metadata_table
    }

    pub fn login_info_table(&self) -> &LoginInfoTable {
        &self.login_info_table
    }

    pub async fn change_email_transactional(
        &self,
        user_email: &str,
        new_user_email: &str,
    ) -> Result<(), String> {
        let txn = self.db.begin().await.map_err(|e| e.to_string())?;

        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "UPDATE user_stats SET user_email = ? WHERE user_email = ?",
            [new_user_email.into(), user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;

        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "UPDATE user_addins SET user_email = ? WHERE user_email = ?",
            [new_user_email.into(), user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;

        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "UPDATE user_metadata SET user_email = ? WHERE user_email = ?",
            [new_user_email.into(), user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;

        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "UPDATE login_info SET user_email = ? WHERE user_email = ?",
            [new_user_email.into(), user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;

        txn.commit().await.map_err(|e| e.to_string())
    }

    pub async fn unregister_user_transactional(&self, user_email: &str) -> Result<(), String> {
        let txn = self.db.begin().await.map_err(|e| e.to_string())?;

        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "DELETE FROM user_stats WHERE user_email = ?",
            [user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;
        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "DELETE FROM user_addins WHERE user_email = ?",
            [user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;
        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "DELETE FROM user_metadata WHERE user_email = ?",
            [user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;
        txn.execute(Statement::from_sql_and_values(
            DatabaseBackend::Sqlite,
            "DELETE FROM login_info WHERE user_email = ?",
            [user_email.into()],
        ))
        .await
        .map_err(|e| e.to_string())?;

        txn.commit().await.map_err(|e| e.to_string())
    }
}
