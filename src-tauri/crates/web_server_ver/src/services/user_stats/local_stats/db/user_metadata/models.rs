use db_manager::db::user_metadata_table::user_metadata;
use serde::{Deserialize, Serialize};

pub fn user_meta_entity_to_model(
    entity: &user_metadata::Model,
) -> Result<UserMetadataModel, serde_json::Error> {
    let body = serde_json::from_value(entity.metadata.clone())?;
    let model = UserMetadataModel {
        user_email: entity.user_email.clone(),
        body,
    };
    Ok(model)
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserMetadataModel {
    pub user_email: String,
    pub body: MetadataBody,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetadataBody {
    pub app_version: Option<String>,
}
