use db_manager::db::user_stats_table::*;
use sea_orm::{prelude::*, ActiveValue::Set};
use std::sync::Arc;

use crate::services::user_stats::*;

pub struct UserStatsTable {
    db: Arc<DatabaseConnection>,
}

impl UserStatsTable {
    pub async fn new_async(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    /// Creates a new user with the given email and name
    /// If the user already exists, this function will return an error
    pub async fn create_user(
        &self,
        user_email: String,
        user_name: String,
    ) -> Result<user::Model, String> {
        // Ensure that the user name and email are not empty
        Self::err_if_str_is_empty(&user_email, "user_email")?;
        Self::err_if_str_is_empty(&user_name, "user_name")?;

        let published_addins = serde_json::to_value(Vec::<PublishedAddinModel>::new()).unwrap();
        let installed_addins = serde_json::to_value(Vec::<InstalledAddinModel>::new()).unwrap();
        let disciplines = serde_json::to_value(Vec::<String>::new()).unwrap();
        let user = user::ActiveModel {
            user_email: Set(user_email),
            user_name: Set(user_name),
            published_addins: Set(published_addins),
            installed_addins: Set(installed_addins),
            disciplines: Set(disciplines),
        };

        let user = user
            .insert(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
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

    pub async fn change_email(
        &self,
        user_email: String,
        new_user_email: String,
    ) -> Result<(), String> {
        println!("Changing email from {} to {}", user_email, new_user_email);

        // First, find the existing user
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(&user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;

        if let Some(user) = user {
            // Delete the old record
            user::Entity::delete_by_id(&user_email)
                .exec(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;

            // Insert a new record with the new email
            let new_user = user::ActiveModel {
                user_email: Set(new_user_email),
                user_name: Set(user.user_name),
                published_addins: Set(user.published_addins),
                installed_addins: Set(user.installed_addins),
                disciplines: Set(user.disciplines),
            };

            new_user
                .insert(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub async fn change_name(
        &self,
        user_email: String,
        new_user_name: String,
    ) -> Result<(), String> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        if let Some(user) = user {
            let user = user::ActiveModel {
                user_name: Set(new_user_name),
                ..user.into()
            };
            user.update(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn set_published_addins(
        &self,
        user_email: &str,
        published_addins: Vec<PublishedAddinModel>,
    ) -> Result<(), String> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        if let Some(user) = user {
            let user = user::ActiveModel {
                published_addins: Set(serde_json::to_value(published_addins).unwrap()),
                ..user.into()
            };
            user.update(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn set_installed_addins(
        &self,
        user_email: &str,
        installed_addins: Vec<InstalledAddinModel>,
    ) -> Result<(), String> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        if let Some(user) = user {
            let user = user::ActiveModel {
                installed_addins: Set(serde_json::to_value(installed_addins).unwrap()),
                ..user.into()
            };
            user.update(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn set_disciplines(
        &self,
        user_email: &str,
        disciplines: Vec<String>,
    ) -> Result<(), String> {
        let user = user::Entity::find()
            .filter(user::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        if let Some(user) = user {
            let user = user::ActiveModel {
                disciplines: Set(serde_json::to_value(disciplines).unwrap()),
                ..user.into()
            };
            user.update(self.db.as_ref())
                .await
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn get_all_user_stats(&self) -> Result<Vec<UserStatsModel>, String> {
        let users = user::Entity::find()
            .all(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        let user_stats = users.into_iter().map(UserStatsModel::from).collect();
        Ok(user_stats)
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
