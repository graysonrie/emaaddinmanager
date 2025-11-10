use std::path::Path;

use crate::services::addins_registry::models::addin_model::AddinModel;
use db_manager::db::user_stats_table::user;
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublishedAddinModel {
    pub addin: AddinModel,
    pub date_published: String,
}

impl From<AddinModel> for PublishedAddinModel {
    fn from(value: AddinModel) -> Self {
        let addin = value.clone();
        let path_str = value.path_to_addin_xml_file;
        let path = Path::new(&path_str);
        let date_published = if path.try_exists().is_ok() {
            path.metadata()
                .and_then(|metadata| metadata.modified())
                .map(|modified_time| {
                    chrono::DateTime::<chrono::Utc>::from(modified_time)
                        .format("%Y-%m-%d")
                        .to_string()
                })
                .unwrap_or_else(|_| "Unknown".to_string())
        } else {
            "Unknown".to_string()
        };
        Self {
            addin,
            date_published,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledAddinModel {
    pub addin: AddinModel,
    pub date_installed: String,
}

impl From<AddinModel> for InstalledAddinModel {
    fn from(value: AddinModel) -> Self {
        let addin = value.clone();
        let path_str = value.path_to_addin_xml_file;
        let path = Path::new(&path_str);
        let date_installed = path
            .metadata()
            .and_then(|metadata| metadata.modified())
            .map(|modified_time| {
                chrono::DateTime::<chrono::Utc>::from(modified_time)
                    .format("%Y-%m-%d")
                    .to_string()
            })
            .unwrap_or_else(|_| "Unknown".to_string());
        Self {
            addin,
            date_installed,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsModel {
    pub user_email: String,
    pub user_name: String,
    pub published_addins: Vec<PublishedAddinModel>,
    pub installed_addins: Vec<InstalledAddinModel>,
    pub disciplines: Vec<String>,
}

impl From<user::Model> for UserStatsModel {
    fn from(user: user::Model) -> Self {
        let published_addins = serde_json::from_value(user.published_addins).unwrap_or_default();
        let installed_addins = serde_json::from_value(user.installed_addins).unwrap_or_default();
        let disciplines = serde_json::from_value(user.disciplines).unwrap_or_default();
        Self {
            user_email: user.user_email,
            user_name: user.user_name,
            published_addins,
            installed_addins,
            disciplines,
        }
    }
}
