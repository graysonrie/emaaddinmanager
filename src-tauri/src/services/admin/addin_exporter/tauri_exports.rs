use revitcli::ErrorList;

use crate::services::admin::addin_exporter::models::dll_model::DllModel;
use crate::services::admin::addin_exporter::models::simplified_addin_info_model::SimplifiedAddinInfoModel;
use crate::services::admin::addin_exporter::service::AddinExporterService;
use crate::services::admin::addin_exporter::usage_tracker;

/// Will return an empty error list if the addin is exported successfully
#[tauri::command]
pub async fn export_addin(
    project_dir: &str,
    addin_file_info: SimplifiedAddinInfoModel,
    extra_dlls: Vec<String>,
    destination_dir: &str,
) -> Result<ErrorList, String> {
    println!("Exporting addin from project directory: {}", project_dir);
    let usage_data_point = usage_tracker::UsageDataPoint::from(addin_file_info.clone());
    match AddinExporterService::create_addin_file_for_project(project_dir, addin_file_info)
        .map_err(|e| ErrorList::new_with_error(&e))
    {
        Ok(path) => {
            println!("Addin file created at: {}", path);

            let mut error_list = ErrorList::new();
            // Update the usage tracker
            // The error is added to the error list, but we don't want to return it
            let _ = usage_tracker::add_usage_data_point(usage_data_point)
                .map_err(|e| error_list.add_error(&e));

            let export_errors: ErrorList = AddinExporterService::export_locally(
                project_dir,
                &extra_dlls.iter().map(|x| x.as_str()).collect::<Vec<&str>>(),
                destination_dir,
            )
            .await;
            for error in export_errors.view_errors() {
                error_list.add_error(&error);
            }
            Ok(error_list)
        }
        Err(e) => Ok(e),
    }
}

#[tauri::command]
pub fn get_addin_file_info(project_dir: &str) -> Result<SimplifiedAddinInfoModel, String> {
    AddinExporterService::get_addin_file_info(project_dir)
}

#[tauri::command]
pub fn get_all_project_dlls(project_dir: &str) -> Result<Vec<DllModel>, String> {
    AddinExporterService::get_all_project_dlls(project_dir)
}

#[tauri::command]
pub async fn build_addin(project_dir: &str) -> Result<String, String> {
    AddinExporterService::build_addin(project_dir).await
}
