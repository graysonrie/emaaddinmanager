use super::entities::user;
use sea_orm::{prelude::*, ActiveValue::Set};
use std::sync::Arc;

use crate::services::{local_db::table_creator::generate_table_lenient, user_stats::*};

pub struct UserStatsTable {
    db: Arc<DatabaseConnection>,
}

impl UserStatsTable {
    pub async fn new_async(db: Arc<DatabaseConnection>) -> Self {
        generate_table_lenient(&db, user::Entity).await;

        Self { db }
    }

    /// Creates a new user with the given email and name
    /// If the user already exists, this function will return an error
    pub async fn create_user(&self, user_email: String, user_name: String) -> Result<user::Model, String> {
        let published_addins = serde_json::to_value(Vec::<PublishedAddinModel>::new()).unwrap();
        let installed_addins = serde_json::to_value(Vec::<InstalledAddinModel>::new()).unwrap();
        let user = user::ActiveModel {
            user_email: Set(user_email),
            user_name: Set(user_name),
            published_addins: Set(published_addins),
            installed_addins: Set(installed_addins),
        };

        let user = user.insert(self.db.as_ref()).await.map_err(|e| e.to_string())?;
        Ok(user)
    }

    /// Returns None if the user does not exist
    pub async fn get_user(&self, user_email: String) -> Result<Option<user::Model>, String> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        Ok(user)
    }
}
