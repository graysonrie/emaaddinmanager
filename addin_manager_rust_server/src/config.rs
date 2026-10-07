use std::path::{Path, PathBuf};

use anyhow::{Context, bail};

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub api_key: String,
    pub port: u16,
    pub assets_dir: PathBuf,
    pub sqlite_seed_path: PathBuf,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let database_url = normalize_database_url(&env_or(
            "DATABASE_URL",
            "postgres://stats:stats@db:5432/stats",
        ));
        let api_key = env_or("API_KEY", "change-me");
        let port = match std::env::var("PORT") {
            Err(_) => 8000,
            Ok(value) => value
                .parse::<u16>()
                .with_context(|| format!("Invalid PORT value: {value}"))?,
        };
        let assets_dir = resolve_assets_dir();
        let sqlite_seed_path = match std::env::var("SQLITE_SEED_PATH") {
            Ok(value) => resolve_sqlite_path(Path::new(&value))?,
            Err(_) => assets_dir.join("UserStats2.db"),
        };

        Ok(Self {
            database_url,
            api_key,
            port,
            assets_dir,
            sqlite_seed_path,
        })
    }

    pub fn validate_seed_assets(&self) -> anyhow::Result<()> {
        if !self.assets_dir.is_dir() {
            bail!(
                "Required assets directory not found: {}. The server cannot start without bundled seed data.",
                self.assets_dir.display()
            );
        }
        if !self.sqlite_seed_path.is_file() {
            bail!(
                "Required SQLite seed file not found: {}. The server cannot start without the initial seed database.",
                self.sqlite_seed_path.display()
            );
        }
        Ok(())
    }
}

pub fn normalize_database_url(url: &str) -> String {
    if let Some(rest) = url.strip_prefix("postgresql+psycopg://") {
        return format!("postgres://{rest}");
    }
    if let Some(rest) = url.strip_prefix("postgresql://") {
        return format!("postgres://{rest}");
    }
    url.to_string()
}

fn env_or(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

fn resolve_sqlite_path(path: &Path) -> anyhow::Result<PathBuf> {
    if path.is_absolute() {
        return Ok(path.to_path_buf());
    }
    Ok(std::env::current_dir()
        .context("failed to read the current directory")?
        .join(path))
}

fn resolve_assets_dir() -> PathBuf {
    for root in candidate_roots() {
        let assets = root.join("assets");
        if assets.is_dir() {
            return assets;
        }
    }
    PathBuf::from("assets")
}

fn candidate_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        roots.push(cwd);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            roots.push(parent.to_path_buf());
        }
    }
    roots.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")));
    roots
}

#[cfg(test)]
mod tests {
    use super::normalize_database_url;

    #[test]
    fn keeps_postgres_urls() {
        let url = "postgres://stats:stats@db:5432/stats?sslmode=require";
        assert_eq!(normalize_database_url(url), url);
    }

    #[test]
    fn rewrites_postgresql_urls() {
        assert_eq!(
            normalize_database_url("postgresql://stats:stats@host:5432/stats?sslmode=require"),
            "postgres://stats:stats@host:5432/stats?sslmode=require"
        );
    }

    #[test]
    fn strips_psycopg_driver() {
        assert_eq!(
            normalize_database_url("postgresql+psycopg://stats:stats@db:5432/stats"),
            "postgres://stats:stats@db:5432/stats"
        );
    }
}
