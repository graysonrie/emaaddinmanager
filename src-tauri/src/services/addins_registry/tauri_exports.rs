use std::sync::Arc;

use crate::services::{
    addins_registry::{
        models::{addin_model::AddinModel, install_request_model::InstallAddinRequestModel},
        services::{local_registry::LocalAddinsRegistryService, AddinsRegistry},
    },
    admin::addin_exporter::models::category_model::CategoryModel,
};
use futures::stream::{FuturesUnordered, StreamExt};
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub async fn get_addins(
    addins_registry_service: State<'_, Arc<LocalAddinsRegistryService>>,
) -> Result<Vec<AddinModel>, String> {
    addins_registry_service
        .get_addins()
        .await
        .map_err(|e| e.to_string())
}

/// Installs a list of addins, emitting an the addin's ID for each addin that is installed
#[tauri::command]
pub async fn install_addins(
    app: AppHandle,
    addins_registry_service: State<'_, Arc<LocalAddinsRegistryService>>,
    install_requests: Vec<InstallAddinRequestModel>,
) -> Result<(), String> {
    let mut futures = FuturesUnordered::new();

    for install_request in install_requests {
        let addins_registry_service = addins_registry_service.clone(); // must be cloneable or Arc
        let app = app.clone(); // must be cloneable or Arc
        futures.push(async move {
            let addin = install_request.addin;
            let for_revit_versions = install_request.for_revit_versions;
            let addin_id = addin.addin_id.clone();
            println!("Installing {}", &addin.name);
            addins_registry_service
                .install_addin(addin, for_revit_versions)
                .await
                .map_err(|e| e.to_string())?;
            app.emit("addin_installed", addin_id)
                .map_err(|e| e.to_string())?;
            Ok::<_, String>(())
        });
    }

    while let Some(result) = futures.next().await {
        result?; // propagate error if any
    }
    Ok(())
}

#[tauri::command]
pub async fn delist_addin(
    addins_registry_service: State<'_, Arc<LocalAddinsRegistryService>>,
    addin: AddinModel,
) -> Result<(), String> {
    addins_registry_service
        .delist_addin(addin)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_categories(
    addins_registry_service: State<'_, Arc<LocalAddinsRegistryService>>,
) -> Result<Vec<CategoryModel>, String> {
    addins_registry_service
        .get_categories()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_category_to_registry(
    addins_registry_service: State<'_, Arc<LocalAddinsRegistryService>>,
    full_category_path: String,
) -> Result<(), String> {
    addins_registry_service
        .add_category(&full_category_path)
        .await
        .map_err(|e| e.to_string())
}
