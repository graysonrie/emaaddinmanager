use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::services::{
    config::keys,
    dev_resources::code_snippets::models::{CodeSnippetModel, FrontendCodeSnippetModel},
    local_db::service::LocalDbService,
};

pub mod models;

pub struct DevCodeSnippetsManager {
    local_db: Arc<LocalDbService>,
}

impl DevCodeSnippetsManager {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self { local_db }
    }

    pub async fn get_all_code_snippets(&self) -> Result<Vec<CodeSnippetModel>, String> {
        let mut snippets = Vec::new();

        let snippets_dir = self.get_app_code_snippets_path().await?;

        for snippet in snippets_dir.iter() {
            match fs::read_to_string(snippet) {
                Ok(text) => {}
                Err(err) => {
                    println!(
                        "Warning: could not read snippet path '{}'. Error: {}",
                        snippet.to_string_lossy(),
                        err
                    );
                }
            }
        }

        Ok(snippets)
    }

    pub async fn add_code_snippet(&self, model: FrontendCodeSnippetModel) {}

    async fn get_app_code_snippets_path(&self) -> Result<PathBuf, String> {
        let local_db_path = keys::get_addins_registry_path(self.local_db.clone()).await?;
        let local_db_path = Path::new(&local_db_path);

        let dev_resources_path = local_db_path.join("DevResources");
        Ok(dev_resources_path.join("CodeSnippets ").clone())
    }
}
