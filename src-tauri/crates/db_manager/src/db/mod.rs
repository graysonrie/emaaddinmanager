use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use sea_orm::DatabaseConnection;
use sqlx::sqlite::SqlitePoolOptions;
use std::time::Duration;

use crate::db::utils::generate_table_lenient;

pub mod login_table;
pub mod user_addins_table;
pub mod user_stats_table;
pub mod user_metadata_table;
pub mod addin_issues_table;
mod utils;

pub async fn initialize(dir: &Path) -> Result<(), String> {
    let path_to_db = create_db_file(dir).await?;
    let db_url = format!("sqlite://{}", path_to_db.to_string_lossy());
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(10))
        .connect(&db_url)
        .await
        .map_err(|e| e.to_string())?;
    let db: Arc<DatabaseConnection> = Arc::new(pool.into());

    create_tables(db).await
}

/// Returns the path to the database file itself
///
/// Only creates the database if it does not exist
async fn create_db_file(dir: &Path) -> Result<PathBuf, String> {
    let path_to_db = dir.join("UserStats2.db");
    if !path_to_db.exists() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
        fs::File::create(&path_to_db).map_err(|e| e.to_string())?;
    }
    Ok(path_to_db)
}

/// Does not upgrade the tables. Only creates them if they do not exist
async fn create_tables(db: Arc<DatabaseConnection>) -> Result<(), String> {
    generate_table_lenient(&db, user_stats_table::user::Entity).await?;
    generate_table_lenient(&db, user_addins_table::user::Entity).await?;
    generate_table_lenient(&db, user_metadata_table::user_metadata::Entity).await?;
    generate_table_lenient(&db, login_table::login_info::Entity).await?;
    println!("Tables created");
    Ok(())
}
