use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    sync::Arc,
};

use uuid::Uuid;

use crate::{
    services::{
        config::keys,
        dev_resources::code_snippets::models::{
            CodeSnippetModel, CodeSnippetsAndGroupsModel, FrontendCodeSnippetModel,
        },
        local_db::service::LocalDbService,
    },
    utils,
};

pub mod models;

pub struct DevCodeSnippetsManager {
    local_db: Arc<LocalDbService>,
}

impl DevCodeSnippetsManager {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self { local_db }
    }

    pub async fn get_all_code_snippets(&self) -> Result<CodeSnippetsAndGroupsModel, String> {
        let mut snippets = Vec::new();
        let mut groups = Vec::new();

        let snippets_dir = self.get_app_code_snippets_path().await?;
        let snippet_dir_clone = snippets_dir.clone();

        // Process the contents of the root directory, not the root directory itself
        let entries = fs::read_dir(&snippets_dir).map_err(|err| {
            format!(
                "Unable to read root directory {}: {}",
                snippets_dir.display(),
                err
            )
        })?;

        for entry in entries {
            let entry = entry.map_err(|err| format!("Unable to read directory entry: {}", err))?;
            let entry_path = entry.path();

            let entry_group_path = Self::get_nested_snippet_path(&snippet_dir_clone, &entry_path);

            groups.push(Ok(entry_group_path));

            Self::process_code_snippet_path(
                entry_path,
                &mut snippets,
                &mut groups,
                snippet_dir_clone.clone(),
            )?;
        }

        let ok_snippets = snippets
            .into_iter()
            .flatten()
            .collect::<Vec<FrontendCodeSnippetModel>>();

        let ok_groups = groups.into_iter().flatten().collect::<Vec<String>>();

        Ok(CodeSnippetsAndGroupsModel {
            code_snippets: ok_snippets,
            groups: ok_groups,
        })
    }

    fn process_code_snippet_path(
        path: PathBuf,
        snippets: &mut Vec<Result<FrontendCodeSnippetModel, String>>,
        groups: &mut Vec<Result<String, String>>,
        dev_snippets_path: PathBuf,
    ) -> Result<(), String> {
        let meta = path
            .metadata()
            .map_err(|err| format!("Unable to get file metadata: {err}"))?;

        if meta.is_dir() {
            // For directories, iterate through all entries
            let entries = fs::read_dir(&path)
                .map_err(|err| format!("Unable to read directory {}: {}", path.display(), err))?;

            for entry in entries {
                let entry =
                    entry.map_err(|err| format!("Unable to read directory entry: {}", err))?;
                let entry_path = entry.path();

                let entry_group_path =
                    Self::get_nested_snippet_path(&dev_snippets_path, &entry_path);

                groups.push(Ok(entry_group_path));

                // Recursively process each entry - PASS THE ENTRY_PATH, not dev_snippets_path
                Self::process_code_snippet_path(
                    entry_path,
                    snippets,
                    groups,
                    dev_snippets_path.clone(),
                )?;
            }
        } else {
            // must be a file:
            match fs::read_to_string(&path) {
                Ok(text) => {
                    let info: CodeSnippetModel =
                        serde_json::from_str(&text).map_err(|e| e.to_string())?;
                    let frontend_snippet =
                        Self::code_snippet_to_frontend_snippet(info, dev_snippets_path, path);
                    snippets.push(Ok(frontend_snippet));
                }
                Err(err) => {
                    snippets.push(Err(format!(
                        "Failed to read file {}: {}",
                        path.display(),
                        err
                    )));
                }
            }
        }

        Ok(())
    }

    pub async fn add_code_snippet(&self, model: FrontendCodeSnippetModel) -> Result<(), String> {
        // 'path' will not include the filename, it just includes directories (if any)
        let dir = Path::new(&model.nested_paths);
        let snippets_dir = self.get_app_code_snippets_path().await?;

        let new_dir = snippets_dir.join(dir);

        std::fs::create_dir_all(&new_dir).map_err(|e| e.to_string())?;

        let id = Uuid::new_v4().to_string();
        let file_name = &format!("{}_{}.json", model.name, id);
        let save_path = new_dir.join(file_name);

        let mut file = File::create(save_path).map_err(|e| e.to_string())?;

        // TODO: maybe put this in helper function:
        let code_snippet = CodeSnippetModel {
            code_snippet_version: "1.0.0".to_string(),
            metadata: model.metadata,
            name: model.name,
            code: model.code,
            description: model.description,
            language: model.language,
        };
        //
        let code_snippet_json =
            serde_json::to_string_pretty(&code_snippet).map_err(|e| e.to_string())?;

        file.write_all(code_snippet_json.as_bytes())
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn get_app_code_snippets_path(&self) -> Result<PathBuf, String> {
        let local_db_path = keys::get_addins_registry_path(self.local_db.clone()).await?;
        let local_db_path = Path::new(&local_db_path);

        let dev_resources_path = local_db_path.join("DevResources");
        Ok(dev_resources_path.join("CodeSnippets").clone())
    }

    fn code_snippet_to_frontend_snippet(
        model: CodeSnippetModel,
        dev_snippets_path: PathBuf, // i.e. S:\BasesRevitAddinsRegistry\DevResources\CodeSnippets
        snippet_path: PathBuf,
    ) -> FrontendCodeSnippetModel {
        let snippet_dir_path = match snippet_path.parent() {
            Some(parent) => parent,
            None => Path::new(""),
        };

        // determine the grouping for the code snippet based on the directory structure:
        let nested_paths = Self::get_nested_snippet_path(&dev_snippets_path, snippet_dir_path);

        FrontendCodeSnippetModel {
            metadata: model.metadata,
            name: model.name,
            code: model.code,
            description: model.description,
            language: model.language,
            nested_paths,
        }
    }
    fn get_nested_snippet_path(dev_snippets_path: &Path, snippet_dir_path: &Path) -> String {
        let dev_snippets_str = dev_snippets_path.to_string_lossy().to_string();
        let dev_snippets_str = utils::double_backslash_to_single_forward_slash(&dev_snippets_str);

        let snippet_dir_path = snippet_dir_path.to_string_lossy().to_string();
        let snippet_dir_path = utils::double_backslash_to_single_forward_slash(&snippet_dir_path);

        snippet_dir_path.replace(&dev_snippets_str, "")
    }
}
