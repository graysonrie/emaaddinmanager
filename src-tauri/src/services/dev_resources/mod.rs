use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::services::{
    config::keys, dev_resources::vs_templates::models::*, local_db::service::LocalDbService,
};
pub mod tauri_exports;

mod vs_templates;

#[derive(Debug)]
pub enum TemplateInstallError {
    VsTemplatesFolderDoesNotExist,
    AppTemplatesFolderDoesNotExist,
    TemplateFetchError(String),
    TemplateNameNotFound(String),
    CopyError(String),
}
impl std::fmt::Display for TemplateInstallError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

pub struct DevResourcesService {
    local_db: Arc<LocalDbService>,
}

impl DevResourcesService {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self { local_db }
    }
    /// Only gets the templates that are verified to exist
    pub async fn get_visual_studio_templates(&self) -> Result<Vec<VsTemplateModel>, String> {
        let mut templates = Vec::new();

        let templates_dir = self.get_app_vstemplates_path().await?;
        let template_info_path = templates_dir.join("vstemplate-info.json");

        let text = fs::read_to_string(template_info_path).map_err(|e| e.to_string())?;
        let info: VsTemplateInfoModel = serde_json::from_str(&text).map_err(|e| e.to_string())?;

        for template in info.templates.iter() {
            let full_template_path = templates_dir.join(&template.relative_path);
            if full_template_path.exists() {
                templates.push(template.clone());
            }
        }

        Ok(templates)
    }
    pub async fn load_image_data_for_template(
        &self,
        template: &VsTemplateModel,
    ) -> Result<Vec<u8>, String> {
        let image_path = self.get_app_vstemplates_path().await?;
        let image_path = image_path.join(&template.relative_path_to_image);
        let image_data = fs::read(image_path).map_err(|e| e.to_string())?;
        Ok(image_data)
    }
    pub fn is_template_installed(&self, template: &VsTemplateModel) -> Result<bool, String> {
        let vs_templates_folder = self.get_visual_studio_templates_folder()?;
        let template_name_path = Path::new(&template.relative_path);
        let template_name_path = template_name_path
            .file_name()
            .ok_or("Template name not found".to_string())?;

        let template_vs_path = vs_templates_folder.join(template_name_path);
        Ok(template_vs_path.exists())
    }
    pub async fn install_visual_studio_templates(
        &self,
        templates: &[FrontendVsTemplateModel],
    ) -> Result<(), TemplateInstallError> {
        let vs_templates_folder = self
            .get_visual_studio_templates_folder()
            .map_err(|_| TemplateInstallError::VsTemplatesFolderDoesNotExist)?;
        let app_vstemplates = self
            .get_app_vstemplates_path()
            .await
            .map_err(|_| TemplateInstallError::AppTemplatesFolderDoesNotExist)?;

        let all_templates = self
            .get_visual_studio_templates()
            .await
            .map_err(TemplateInstallError::TemplateFetchError)?;

        for frontend_template in templates {
            // Find the template in the all_templates whose display_name matches the template.display_name
            let backend_template = all_templates
                .iter()
                .find(|t| t.display_name == frontend_template.display_name)
                .ok_or(TemplateInstallError::TemplateNameNotFound(
                    frontend_template.display_name.clone(),
                ))?;

            let template_file_name = Path::new(&backend_template.relative_path)
                .file_name()
                .ok_or(TemplateInstallError::TemplateNameNotFound(
                    backend_template.display_name.clone(),
                ))?;

            let dest = vs_templates_folder.join(template_file_name);
            let src = app_vstemplates.join(template_file_name);
            fs::copy(&src, &dest).map_err(|e| {
                TemplateInstallError::CopyError(format!(
                    "Failed to copy {} to {}. Full error: {}",
                    &src.display(),
                    &dest.display(),
                    e
                ))
            })?;
        }

        Ok(())
    }
    fn get_visual_studio_templates_folder(&self) -> Result<PathBuf, String> {
        let documents =
            dirs::document_dir().ok_or("Documents directory does not exist".to_string())?;
        // assume only visual studio 2022 is supported
        let vs_path = documents.join("Visual Studio 2022");
        Ok(vs_path.join("Templates\\ProjectTemplates"))
    }
    async fn get_app_vstemplates_path(&self) -> Result<PathBuf, String> {
        let local_db_path = keys::get_addins_registry_path(self.local_db.clone()).await?;
        let local_db_path = Path::new(&local_db_path);

        let dev_resources_path = local_db_path.join("DevResources");
        Ok(dev_resources_path.join("VSTemplates").clone())
    }
}
