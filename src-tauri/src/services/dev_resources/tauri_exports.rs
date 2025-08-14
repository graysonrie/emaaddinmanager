use std::sync::Arc;

use tauri::State;

use crate::services::dev_resources::{
    vs_templates::models::FrontendVsTemplateModel, DevResourcesService,
};

#[tauri::command]
pub async fn get_dev_visual_studio_templates(
    dev_service: State<'_, Arc<DevResourcesService>>,
) -> Result<Vec<FrontendVsTemplateModel>, String> {
    let models = dev_service.get_visual_studio_templates().await?;
    let futures = models
        .into_iter()
        .map(|model| async {
            let image_data = dev_service.load_image_data_for_template(&model).await?;
            let is_installed = dev_service.is_template_installed(&model)?;
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
    dev_service
        .install_visual_studio_templates(&templates)
        .await
        .map_err(|e| e.to_string())
}
