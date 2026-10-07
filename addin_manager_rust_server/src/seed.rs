use std::path::Path;

use anyhow::Context;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, EntityTrait, TransactionTrait};
use serde_json::{Value, json};

use crate::entities::{login_info, seed_metadata, user_addins, user_metadata, user_stats};

pub async fn run(db: &sea_orm::DatabaseConnection, sqlite_path: &Path) -> anyhow::Result<()> {
    let already_seeded = seed_metadata::Entity::find()
        .one(db)
        .await
        .context("failed to read seed metadata")?
        .is_some_and(|marker| marker.seeded);

    if already_seeded {
        println!("[seed] Postgres already seeded; skipping SQLite import.");
        return Ok(());
    }

    println!(
        "[seed] First start: importing data from {} ...",
        sqlite_path.display()
    );
    let data = read_sqlite(sqlite_path)
        .with_context(|| format!("failed to read SQLite seed {}", sqlite_path.display()))?;

    let txn = db
        .begin()
        .await
        .context("failed to start the seed transaction")?;
    for row in data.user_stats {
        user_stats::ActiveModel {
            user_email: Set(row.user_email),
            user_name: Set(row.user_name),
            published_addins: Set(row.published_addins),
            installed_addins: Set(row.installed_addins),
            disciplines: Set(row.disciplines),
            date_added: Set(row.date_added),
        }
        .insert(&txn)
        .await
        .context("failed to insert user_stats seed row")?;
    }
    for row in data.user_addins {
        user_addins::ActiveModel {
            user_email: Set(row.user_email),
            allowed_addin_ids: Set(row.allowed_addin_ids),
            allowed_addin_paths: Set(row.allowed_addin_paths),
            blocked_addin_paths: Set(json!([])),
            discipline: Set(row.discipline),
        }
        .insert(&txn)
        .await
        .context("failed to insert user_addins seed row")?;
    }
    for row in data.user_metadata {
        user_metadata::ActiveModel {
            user_email: Set(row.user_email),
            metadata: Set(row.metadata),
        }
        .insert(&txn)
        .await
        .context("failed to insert user_metadata seed row")?;
    }
    for row in data.login_info {
        login_info::ActiveModel {
            user_email: Set(row.user_email),
            password_hash: Set(row.password_hash),
            salt: Set(row.salt),
        }
        .insert(&txn)
        .await
        .context("failed to insert login_info seed row")?;
    }

    seed_metadata::ActiveModel {
        seeded: Set(true),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .context("failed to record seed metadata")?;

    txn.commit()
        .await
        .context("failed to commit the seed transaction")?;
    println!("[seed] SQLite import complete.");
    Ok(())
}

struct SeedData {
    user_stats: Vec<UserStatsSeed>,
    user_addins: Vec<UserAddinsSeed>,
    user_metadata: Vec<UserMetadataSeed>,
    login_info: Vec<LoginInfoSeed>,
}

struct UserStatsSeed {
    user_email: String,
    user_name: String,
    published_addins: Value,
    installed_addins: Value,
    disciplines: Value,
    date_added: Option<String>,
}

struct UserAddinsSeed {
    user_email: String,
    allowed_addin_ids: Value,
    allowed_addin_paths: Value,
    discipline: String,
}

struct UserMetadataSeed {
    user_email: String,
    metadata: Value,
}

struct LoginInfoSeed {
    user_email: String,
    password_hash: String,
    salt: String,
}

fn read_sqlite(path: &Path) -> Result<SeedData, rusqlite::Error> {
    let conn = rusqlite::Connection::open(path)?;
    Ok(SeedData {
        user_stats: read_user_stats(&conn)?,
        user_addins: read_user_addins(&conn)?,
        user_metadata: read_user_metadata(&conn)?,
        login_info: read_login_info(&conn)?,
    })
}

fn read_user_stats(conn: &rusqlite::Connection) -> Result<Vec<UserStatsSeed>, rusqlite::Error> {
    let mut statement = conn.prepare("SELECT * FROM user_stats")?;
    let has_date_added = statement
        .column_names()
        .iter()
        .any(|name| *name == "date_added");
    let rows = statement.query_map([], |row| {
        let date_added = if has_date_added {
            row.get("date_added")?
        } else {
            None
        };
        Ok(UserStatsSeed {
            user_email: row.get("user_email")?,
            user_name: row.get("user_name")?,
            published_addins: parse_json(row.get("published_addins")?, json!([])),
            installed_addins: parse_json(row.get("installed_addins")?, json!([])),
            disciplines: parse_json(row.get("disciplines")?, json!([])),
            date_added,
        })
    })?;
    rows.collect()
}

fn read_user_addins(conn: &rusqlite::Connection) -> Result<Vec<UserAddinsSeed>, rusqlite::Error> {
    let mut statement = conn.prepare("SELECT * FROM user_addins")?;
    let rows = statement.query_map([], |row| {
        Ok(UserAddinsSeed {
            user_email: row.get("user_email")?,
            allowed_addin_ids: parse_json(row.get("allowed_addin_ids")?, json!([])),
            allowed_addin_paths: parse_json(row.get("allowed_addin_paths")?, json!([])),
            discipline: row.get("discipline")?,
        })
    })?;
    rows.collect()
}

fn read_user_metadata(
    conn: &rusqlite::Connection,
) -> Result<Vec<UserMetadataSeed>, rusqlite::Error> {
    let mut statement = conn.prepare("SELECT * FROM user_metadata")?;
    let rows = statement.query_map([], |row| {
        Ok(UserMetadataSeed {
            user_email: row.get("user_email")?,
            metadata: parse_json(row.get("metadata")?, json!({})),
        })
    })?;
    rows.collect()
}

fn read_login_info(conn: &rusqlite::Connection) -> Result<Vec<LoginInfoSeed>, rusqlite::Error> {
    let mut statement = conn.prepare("SELECT * FROM login_info")?;
    let rows = statement.query_map([], |row| {
        Ok(LoginInfoSeed {
            user_email: row.get("user_email")?,
            password_hash: row.get("password_hash")?,
            salt: row.get("salt")?,
        })
    })?;
    rows.collect()
}

fn parse_json(value: Option<String>, default: Value) -> Value {
    let Some(value) = value else {
        return default;
    };
    serde_json::from_str(&value).unwrap_or(default)
}

#[cfg(test)]
mod tests {
    use super::read_sqlite;
    use std::path::PathBuf;

    #[test]
    fn bundled_seed_database_is_readable() {
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("assets")
            .join("UserStats2.db");
        let data = read_sqlite(&path).expect("bundled seed database should open");
        assert!(!data.user_stats.is_empty());
        assert!(!data.user_addins.is_empty());
        assert!(!data.user_metadata.is_empty());
        assert!(!data.login_info.is_empty());
        assert!(
            data.user_stats
                .iter()
                .any(|row| row.published_addins.is_array())
        );
        assert!(
            data.user_addins.iter().all(|row| {
                row.allowed_addin_ids.is_array() && row.allowed_addin_paths.is_array()
            })
        );
    }
}
