use serde::{Deserialize, Serialize};

use db_manager::db::user_addins_table::user;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserModel {
    pub user_email: String,
    pub allowed_addin_ids: Vec<String>,
    pub allowed_addin_paths: Vec<String>,
    pub discipline: String,
}

impl TryFrom<user::Model> for UserModel {
    type Error = serde_json::Error;
    fn try_from(user: user::Model) -> Result<Self, Self::Error> {
        let allowed_addin_ids = serde_json::from_value(user.allowed_addin_ids)?;
        let allowed_addin_paths = serde_json::from_value(user.allowed_addin_paths)?;
        Ok(Self {
            user_email: user.user_email,
            allowed_addin_ids,
            allowed_addin_paths,
            discipline: user.discipline,
        })
    }
}
