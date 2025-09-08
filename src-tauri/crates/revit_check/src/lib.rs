use crate::models::RevitProcessModel;

mod helpers;
mod models;

pub fn get_revit_processes() -> Result<Vec<RevitProcessModel>, String> {
    let result = helpers::get_running_revit_processes()?;
    Ok(result.into_iter().map(|p| p.into()).collect())
}

pub async fn is_revit_running() -> Result<bool, String> {
    tokio::task::spawn_blocking(helpers::is_revit_running)
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
}
