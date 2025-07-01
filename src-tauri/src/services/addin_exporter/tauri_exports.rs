use rev::ErrorList;

use crate::services::addin_exporter::models::dll_model::DllModel;
use crate::services::addin_exporter::models::simplified_addin_info_model::SimplifiedAddinInfoModel;
use crate::services::addin_exporter::service::AddinExporterService;

#[tauri::command]
pub fn export_addin(
    project_dir: &str,
    addin_file_info: SimplifiedAddinInfoModel,
    extra_dlls: Vec<String>,
    destination_dir: &str,
) -> Result<(), ErrorList> {
    AddinExporterService::create_addin_file_for_project(project_dir, addin_file_info)
        .map_err(|e| ErrorList::new_with_error(&e))?;
    AddinExporterService::export_locally(
        project_dir,
        &extra_dlls.iter().map(|x| x.as_str()).collect::<Vec<&str>>(),
        destination_dir,
    )
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
pub fn build_addin(project_dir: &str) -> Result<String, String> {
    AddinExporterService::build_addin(project_dir)
}
