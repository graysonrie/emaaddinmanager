use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use sea_orm::DatabaseConnection;
use sqlx::SqlitePool;

use crate::db::utils::generate_table_lenient;

pub mod user_addins_table;
pub mod user_stats_table;
mod utils;

pub async fn initialize(dir: &Path) {
    let path_to_db = create_db_file(dir).await;
    let db_url = format!("sqlite://{}", path_to_db.to_string_lossy());
    let db: Arc<DatabaseConnection> = Arc::new(SqlitePool::connect(&db_url).await.unwrap().into());

    create_tables(db).await;
}

/// Returns the path to the database file itself
///
/// Only creates the database if it does not exist
async fn create_db_file(dir: &Path) -> PathBuf {
    let path_to_db = dir.join("UserStats.db");
    if !path_to_db.exists() {
        fs::create_dir_all(dir).unwrap();
        fs::File::create(&path_to_db).unwrap();
    }
    path_to_db
}

/// Does not upgrade the tables. Only creates them if they do not exist
async fn create_tables(db: Arc<DatabaseConnection>) {
    generate_table_lenient(&db, user_stats_table::user::Entity).await;
    generate_table_lenient(&db, user_addins_table::user::Entity).await;
    println!("Tables created");
}
