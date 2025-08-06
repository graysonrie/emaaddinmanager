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

    pub async fn set_allowed_addin_paths(
        &self,
        user_email: String,
        paths: Vec<String>,
    ) -> Result<(), UserAddinsError> {
        let user = self.get_user(user_email.clone()).await?;
        match user {
            Some(user) => {
                let mut active_user = user.into_active_model();

                // Sort and deduplicate the new paths
                let mut new_allowed_addin_paths = paths;
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

    pub async fn change_email(
        &self,
        user_email: String,
        new_user_email: String,
    ) -> Result<(), UserAddinsError> {
        println!("Changing email from {} to {}", user_email, new_user_email);

        // First, find the existing user
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(&user_email))
            .one(self.db.as_ref())
            .await
            .map_err(UserAddinsError::DbError)?;

        if let Some(user) = user {
            // Delete the old record
            user::Entity::delete_by_id(&user_email)
                .exec(self.db.as_ref())
                .await
                .map_err(UserAddinsError::DbError)?;

            // Insert a new record with the new email
            let new_user = user::ActiveModel {
                user_email: Set(new_user_email),
                allowed_addin_ids: Set(user.allowed_addin_ids),
                allowed_addin_paths: Set(user.allowed_addin_paths),
                discipline: Set(user.discipline),
            };

            new_user
                .insert(self.db.as_ref())
                .await
                .map_err(UserAddinsError::DbError)?;
        }

        Ok(())
    }

    pub async fn delete_user(&self, user_email: &str) -> Result<(), String> {
        user::Entity::delete_by_id(user_email)
            .exec(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
