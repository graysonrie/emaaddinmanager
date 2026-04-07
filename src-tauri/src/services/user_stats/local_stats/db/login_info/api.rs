use std::sync::Arc;

use db_manager::db::login_table::login_info;
use sea_orm::{prelude::*, sea_query::OnConflict, ActiveValue::Set, EntityTrait};

pub struct LoginInfoTable {
    db: Arc<DatabaseConnection>,
}

impl LoginInfoTable {
    pub fn new_async(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn set_user_password(
        &self,
        user_email: String,
        hashed_password: String,
        salt: String,
    ) -> Result<(), String> {
        login_info::Entity::insert(login_info::ActiveModel {
            user_email: Set(user_email),
            password_hash: Set(hashed_password),
            salt: Set(salt),
        })
        .on_conflict(
            OnConflict::column(login_info::Column::UserEmail)
                .update_columns([login_info::Column::PasswordHash, login_info::Column::Salt])
                .to_owned(),
        )
        .exec(self.db.as_ref())
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Will return the hashed password and the salt, not plaintext!!
    pub async fn get_user_credentials(
        &self,
        user_email: String,
    ) -> Result<Option<login_info::Model>, String> {
        let user = login_info::Entity::find()
            .filter(login_info::Column::UserEmail.eq(user_email))
            .one(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        Ok(user)
    }

    pub async fn delete_user(&self, user_email: &str) -> Result<(), String> {
        login_info::Entity::delete_many()
            .filter(login_info::Column::UserEmail.eq(user_email))
            .exec(self.db.as_ref())
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
