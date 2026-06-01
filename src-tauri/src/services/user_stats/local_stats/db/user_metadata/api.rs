use db_manager::db::user_metadata_table::user_metadata;
use serde_json::json;

use crate::services::user_stats::db::client::StatsApiClient;
use crate::services::user_stats::db::user_metadata::models::{
    user_meta_entity_to_model, MetadataBody, UserMetadataModel,
};

pub struct UserMetadataTable {
    client: StatsApiClient,
}

impl UserMetadataTable {
    pub fn new(client: StatsApiClient) -> Self {
        Self { client }
    }

    pub async fn get_or_create_metadata(
        &self,
        user_email: String,
    ) -> Result<UserMetadataModel, String> {
        Self::err_if_str_is_empty(&user_email, "user_email")?;

        let entity: user_metadata::Model = self
            .client
            .post_json(
                &format!("/user-metadata/{user_email}/get-or-create"),
                &json!({}),
            )
            .await?;
        user_meta_entity_to_model(&entity).map_err(|e| e.to_string())
    }

    pub async fn set_metadata(
        &self,
        user_email: String,
        metadata: MetadataBody,
    ) -> Result<(), String> {
        Self::err_if_str_is_empty(&user_email, "user_email")?;
        let metadata = serde_json::to_value(metadata).map_err(|e| e.to_string())?;

        self.client
            .put_no_content(
                &format!("/user-metadata/{user_email}"),
                &json!({ "metadata": metadata }),
            )
            .await
    }

    pub async fn get_metadata_many(
        &self,
        user_emails: Vec<String>,
    ) -> Result<Vec<UserMetadataModel>, String> {
        let entities: Vec<user_metadata::Model> = self
            .client
            .post_json("/user-metadata/query", &json!({ "userEmails": user_emails }))
            .await?;
        let users = entities
            .iter()
            .map(user_meta_entity_to_model)
            .collect::<Result<Vec<UserMetadataModel>, serde_json::Error>>()
            .map_err(|e| e.to_string())?;
        Ok(users)
    }

    // Util:
    fn err_if_str_is_empty(str: &str, value_name: &str) -> Result<(), String> {
        if str.is_empty() {
            return Err(format!(
                "The value {} cannot be empty, received an empty value",
                value_name
            ));
        }
        Ok(())
    }
}
