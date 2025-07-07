use serde::{Deserialize, Serialize};

use crate::services::user_stats::db::user;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublishedAddinModel {
    pub addin_id: String,
    pub date_published: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledAddinModel {
    pub addin_id: String,
    pub date_installed: String,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsModel {
    pub user_email: String,
    pub user_name: String,
    pub published_addins: Vec<PublishedAddinModel>,
    pub installed_addins: Vec<InstalledAddinModel>,
}

impl From<user::Model> for UserStatsModel {
    fn from(user: user::Model) -> Self {
        let published_addins = serde_json::from_value(user.published_addins).unwrap_or_default();
        let installed_addins = serde_json::from_value(user.installed_addins).unwrap_or_default();
        Self {
            user_email: user.user_email,
            user_name: user.user_name,
            published_addins,
            installed_addins,
        }
    }
}
