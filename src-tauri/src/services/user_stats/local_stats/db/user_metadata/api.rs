use std::sync::Arc;

use db_manager::db::user_metadata_table::user_metadata;
use sea_orm::{prelude::*, sea_query::OnConflict, ActiveValue::Set};
use sea_orm::{DatabaseConnection, EntityTrait};

use crate::services::user_stats::db::user_metadata::models::{
    user_meta_entity_to_model, MetadataBody, UserMetadataModel,
};

pub struct UserMetadataTable {
    db: Arc<DatabaseConnection>,
}

impl UserMetadataTable {
    pub async fn new_async(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
    pub async fn get_or_create_metadata(
        &self,
        user_email: String,
    ) -> Result<UserMetadataModel, String> {
        Self::err_if_str_is_empty(&user_email, "user_email")?;

        let user = user_metadata::Entity::find()
            .filter(user_metadata::Column::UserEmail.eq(&user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;

        match user {
            Some(user) => user_meta_entity_to_model(&user).map_err(|e| e.to_string()),
            None => {
                let user = user_metadata::ActiveModel {
                    user_email: Set(user_email),
                    metadata: Set(serde_json::to_value(MetadataBody { app_version: None })
                        .map_err(|e| e.to_string())?),
                };
                let user = user
                    .insert(self.db.as_ref())
                    .await
                    .map_err(|e| e.to_string())?;
                user_meta_entity_to_model(&user).map_err(|e| e.to_string())
            }
        }
    }
    pub async fn set_metadata(
        &self,
        user_email: String,
        metadata: MetadataBody,
    ) -> Result<(), String> {
        Self::err_if_str_is_empty(&user_email, "user_email")?;
        let metadata = serde_json::to_value(metadata).map_err(|e| e.to_string())?;

        user_metadata::Entity::insert(user_metadata::ActiveModel {
            user_email: Set(user_email),
            metadata: Set(metadata),
        })
        .on_conflict(
            OnConflict::column(user_metadata::Column::UserEmail)
                .update_columns([user_metadata::Column::Metadata])
                .to_owned(),
        )
        .exec(self.db.as_ref())
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }
    pub async fn get_metadata_many(
        &self,
        user_emails: Vec<String>,
    ) -> Result<Vec<UserMetadataModel>, String> {
        let users = user_metadata::Entity::find()
            .filter(user_metadata::Column::UserEmail.is_in(user_emails))
            .all(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        let users = users
            .into_iter()
            .map(|e| user_meta_entity_to_model(&e))
            .collect::<Result<Vec<UserMetadataModel>, serde_json::Error>>()
            .map_err(|e| e.to_string())?;
        Ok(users)
    }

    pub async fn delete_user(&self, user_email: &str) -> Result<(), String> {
        user_metadata::Entity::delete_many()
            .filter(user_metadata::Column::UserEmail.eq(user_email))
            .exec(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
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
