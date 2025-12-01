use std::sync::Arc;

use rocket::{State, fs::NamedFile, get, http::Status, post, response::status, serde::json::Json};

use crate::{
    middleware::auth::AuthenticatedUser,
    services::{
        addins_registry::AddinModel,
        admin::addin_packages::{models::AddinPackageInfoModel, service::AddinPackagesService},
    },
};

// #[tauri::command]
// pub async fn create_package_for_registry_addin(
//     addin: AddinModel,
//     request: CreateAddinPackageRequestModel,
//     service: &State<Arc<AddinPackagesService>>,
// ) -> Result<(), String> {
//     service
//         .create_package_for_registry_addin(&addin, &request)
//         .await
// }

// #[tauri::command]
// pub async fn get_all_addin_packages(
//     service: &State<Arc<AddinPackagesService>>,
// ) -> Result<Vec<AddinPackageInfoModel>, String> {
//     service.get_all_addin_packages().await
// }

#[get("/get_package_info_for_registry_addin", data = "<addin>")]
pub async fn get_package_info_for_registry_addin(
    addin: Json<AddinModel>,
    _user: AuthenticatedUser,
    service: &State<Arc<AddinPackagesService>>,
) -> Result<Json<AddinPackageInfoModel>, status::Custom<Json<String>>> {
    let result = service
        .get_package_info_for_registry_addin(&addin.into_inner())
        .await;
    match result {
        Ok(Some(package)) => Ok(Json(package)),
        Ok(None) => Err(status::Custom(
            Status::NotFound,
            Json("Package not found".to_string()),
        )),
        Err(e) => Err(status::Custom(Status::InternalServerError, Json(e))),
    }
}

// #[tauri::command]
// pub async fn check_file_exists(file_path: String) -> Result<bool, String> {
//     use std::path::Path;
//     Ok(Path::new(&file_path).exists())
// }

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetAddinPackageRequest {
    pub name: String,
}
#[post("/get_image_bytes_for_package", data = "<request>")]
pub async fn load_image_data_for_package(
    request: Json<GetAddinPackageRequest>,
    _user: AuthenticatedUser,
    service: &State<Arc<AddinPackagesService>>,
) -> Result<NamedFile, status::Custom<Json<String>>> {
    // Get all packages and find the one matching the name
    let all_packages = service
        .get_all_addin_packages()
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, Json(e)))?;

    let package = all_packages
        .iter()
        .find(|p| p.display_name == request.name)
        .ok_or_else(|| {
            status::Custom(
                Status::NotFound,
                Json(format!("Package '{}' not found", request.name)),
            )
        })?;

    let image_path = service
        .get_image_file_path(package)
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, Json(e)))?;

    if let Ok(file) = NamedFile::open(image_path).await {
        return Ok(file);
    }
    Err(status::Custom(
        Status::NotFound,
        Json(format!("Image file does not exist")),
    ))
}

#[post("/load_help_file_for_package", data = "<request>")]
pub async fn load_help_file_for_package(
    request: Json<GetAddinPackageRequest>,
    _user: AuthenticatedUser,
    service: &State<Arc<AddinPackagesService>>,
) -> Result<NamedFile, status::Custom<Json<String>>> {
    let all_packages = service
        .get_all_addin_packages()
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, Json(e)))?;

    let package = all_packages
        .iter()
        .find(|p| p.display_name == request.name)
        .ok_or_else(|| {
            status::Custom(
                Status::NotFound,
                Json(format!("Package '{}' not found", request.name)),
            )
        })?;

    let path = service
        .get_help_file_path(package)
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, Json(e)))?;

    if let Ok(file) = NamedFile::open(path).await {
        return Ok(file);
    }
    Err(status::Custom(
        Status::NotFound,
        Json(format!("Help file does not exist")),
    ))
}
