use db_manager::db::user_addins_table::*;
use sea_orm::{prelude::*, ActiveValue::Set, IntoActiveModel};
use std::{fmt::Display, sync::Arc};

pub struct UserAddinsTable {
    db: Arc<DatabaseConnection>,
}

#[derive(Debug)]
pub enum UserAddinsError {
    UserNotFound,
    DbError(DbErr),
    SerializationError(String),
}
impl Display for UserAddinsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl UserAddinsTable {
    pub async fn new_async(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_user(
        &self,
        user_email: String,
        user_discipline: String,
    ) -> Result<user::Model, UserAddinsError> {
        let allowed_addin_ids = serde_json::to_value(Vec::<String>::new())
            .map_err(|e| UserAddinsError::SerializationError(e.to_string()))?;
        let allowed_addin_paths = serde_json::to_value(Vec::<String>::new())
            .map_err(|e| UserAddinsError::SerializationError(e.to_string()))?;

        let user = user::ActiveModel {
            user_email: Set(user_email),
            allowed_addin_ids: Set(allowed_addin_ids),
            allowed_addin_paths: Set(allowed_addin_paths),
            discipline: Set(user_discipline),
        };
        let user = user
            .insert(self.db.as_ref())
            .await
            .map_err(UserAddinsError::DbError)?;
        Ok(user)
    }

    pub async fn get_user(
        &self,
        user_email: String,
    ) -> Result<Option<user::Model>, UserAddinsError> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(UserAddinsError::DbError)?;
        Ok(user)
    }

    pub async fn add_allowed_addin_paths(
        &self,
        user_email: String,
        paths: Vec<String>,
    ) -> Result<(), UserAddinsError> {
        let user = self.get_user(user_email.clone()).await?;
        match user {
            Some(user) => {
                let addin_paths = user.allowed_addin_paths.clone();
                let mut active_user = user.into_active_model();

                // Safely deserialize, defaulting to empty Vec if not present or wrong type
                let allowed_addin_paths: Vec<String> =
                    serde_json::from_value(addin_paths).unwrap_or_else(|_| Vec::new());

                // Combine and deduplicate
                let mut new_allowed_addin_paths = allowed_addin_paths;
                new_allowed_addin_paths.extend(paths);
                new_allowed_addin_paths.sort();
                new_allowed_addin_paths.dedup();

                // Safely serialize
                active_user.allowed_addin_paths =
                    Set(serde_json::to_value(new_allowed_addin_paths)
                        .map_err(|e| UserAddinsError::SerializationError(e.to_string()))?);

                active_user
                    .update(self.db.as_ref())
                    .await
                    .map_err(UserAddinsError::DbError)?;

                Ok(())
            }
            None => Err(UserAddinsError::UserNotFound),
        }
    }

    pub async fn remove_allowed_addin_paths(
        &self,
        user_email: String,
        paths: Vec<String>,
    ) -> Result<(), UserAddinsError> {
        let user = self.get_user(user_email.clone()).await?;
        match user {
            Some(user) => {
                let addin_paths = user.allowed_addin_paths.clone();
                let mut active_user = user.into_active_model();

                // Deserialize current allowed paths
                let mut allowed_addin_paths: Vec<String> =
                    serde_json::from_value(addin_paths).unwrap_or_else(|_| Vec::new());

                // Remove any paths that match those in the input
                allowed_addin_paths.retain(|p| !paths.contains(p));

                // Serialize and update
                active_user.allowed_addin_paths = Set(serde_json::to_value(allowed_addin_paths)
                    .map_err(|e| UserAddinsError::SerializationError(e.to_string()))?);

                active_user
                    .update(self.db.as_ref())
                    .await
                    .map_err(UserAddinsError::DbError)?;

                Ok(())
            }
            None => Err(UserAddinsError::UserNotFound),
        }
    }
}
