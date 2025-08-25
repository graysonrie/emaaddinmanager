use std::sync::Arc;

use tauri::State;

use crate::services::dev_resources::{
    code_snippets::models::{CodeSnippetsAndGroupsModel, FrontendCodeSnippetModel}, vs_templates::models::FrontendVsTemplateModel,
    DevResourcesService,
};

#[tauri::command]
pub async fn get_dev_visual_studio_templates(
    dev_service: State<'_, Arc<DevResourcesService>>,
) -> Result<Vec<FrontendVsTemplateModel>, String> {
    let vstemplates = dev_service.get_vs_template_manager();
    let models = vstemplates.get_visual_studio_templates().await?;
    let futures = models
        .into_iter()
        .map(|model| async {
            let image_data = vstemplates.load_image_data_for_template(&model).await?;
            let is_installed = vstemplates.is_template_installed(&model)?;
            Ok(FrontendVsTemplateModel {
                version: model.version,
                display_name: model.display_name,
                description: model.description,
                image_data,
                is_installed,
            })
        })
        .collect::<Vec<_>>();

    let frontend_models = futures::future::join_all(futures)
        .await
        .into_iter()
        .filter_map(|result: Result<FrontendVsTemplateModel, String>| result.ok())
        .collect();
    Ok(frontend_models)
}

#[tauri::command]
pub async fn install_dev_visual_studio_templates(
    dev_service: State<'_, Arc<DevResourcesService>>,
    templates: Vec<FrontendVsTemplateModel>,
) -> Result<(), String> {
    let vstemplates = dev_service.get_vs_template_manager();
    vstemplates
        .install_visual_studio_templates(&templates)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_dev_code_snippets(
    dev_service: State<'_, Arc<DevResourcesService>>,
) -> Result<CodeSnippetsAndGroupsModel, String> {
    let snippets = dev_service.get_code_snippets_manager();
    snippets.get_all_code_snippets().await
}

#[tauri::command]
pub async fn add_dev_code_snippet(
    dev_service: State<'_, Arc<DevResourcesService>>,
    snippet: FrontendCodeSnippetModel,
) -> Result<(), String> {
    let snippets = dev_service.get_code_snippets_manager();
    snippets.add_code_snippet(snippet).await
}
