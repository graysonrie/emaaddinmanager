use std::sync::Arc;

use crate::services::{
    dev_resources::{code_snippets::DevCodeSnippetsManager, vs_templates::DevVsTemplatesManager},
    local_db::service::LocalDbService,
};
pub mod tauri_exports;

mod code_snippets;
mod vs_templates;

pub struct DevResourcesService {
    vs_templates: DevVsTemplatesManager,
    code_snippets: DevCodeSnippetsManager,
}

impl DevResourcesService {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self {
            vs_templates: DevVsTemplatesManager::new(local_db.clone()),
            code_snippets: DevCodeSnippetsManager::new(local_db),
        }
    }
    pub fn get_vs_template_manager(&self) -> &DevVsTemplatesManager {
        &self.vs_templates
    }

    pub fn get_code_snippets_manager(&self) -> &DevCodeSnippetsManager {
        &self.code_snippets
    }
}
