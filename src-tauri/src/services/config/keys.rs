use std::sync::Arc;

use crate::{
    models::kv_store_value::KvStoreValue,
    services::{config::models::AddinToInstallModel, local_db::service::LocalDbService},
};

pub const LOCAL_ADDIN_REGISTRY_PATH: &str = "localAddinRegistryPath";
pub const USER_EMAIL: &str = "userEmail";
pub const USER_NAME: &str = "userName";
pub const USER_DISCIPLINES: &str = "userDisciplines";
// A list of all of the addins to install or update
pub const ADDINS_TO_INSTALL: &str = "addinsToInstall";
// A list of all of the addins to uninstall
pub const ADDINS_TO_UNINSTALL: &str = "addinsToUninstall";

/// Get the user email from the local database
pub async fn get_user_email(local_db: Arc<LocalDbService>) -> Result<String, String> {
    let user_email = KvStoreValue::<String>::new_default(USER_EMAIL, local_db.clone())
        .get_data_updated()
        .await?;
    Ok(user_email)
}

/// Get the user name from the local database
pub async fn get_user_name(local_db: Arc<LocalDbService>) -> Result<String, String> {
    let user_name = KvStoreValue::<String>::new_default(USER_NAME, local_db.clone())
        .get_data_updated()
        .await?;
    Ok(user_name)
}

pub async fn get_user_disciplines(local_db: Arc<LocalDbService>) -> Result<Vec<String>, String> {
    let user_disciplines =
        KvStoreValue::<Vec<String>>::new_default(USER_DISCIPLINES, local_db.clone())
            .get_data_updated()
            .await?;
    Ok(user_disciplines)
}

pub async fn get_addins_to_install(
    local_db: Arc<LocalDbService>,
) -> Result<Vec<AddinToInstallModel>, String> {
    let addins_to_install =
        KvStoreValue::<Vec<AddinToInstallModel>>::new_default(ADDINS_TO_INSTALL, local_db.clone())
            .get_data_updated()
            .await?;
    Ok(addins_to_install)
}

pub async fn get_addins_to_uninstall(
    local_db: Arc<LocalDbService>,
) -> Result<Vec<AddinToInstallModel>, String> {
    let addins_to_uninstall = KvStoreValue::<Vec<AddinToInstallModel>>::new_default(
        ADDINS_TO_UNINSTALL,
        local_db.clone(),
    )
    .get_data_updated()
    .await?;
    Ok(addins_to_uninstall)
}
