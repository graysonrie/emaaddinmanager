use std::sync::Arc;

use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand_core::OsRng;

use crate::{
    constants::TEMP_PASSWORD,
    services::{
        config, local_db::service::LocalDbService, login_info::PasswordHashResult,
        user_stats::LocalUserStatsService,
    },
};

pub struct LoginInfoService {
    local_db: Arc<LocalDbService>,
    local_stats: Arc<LocalUserStatsService>,
}

impl LoginInfoService {
    pub fn new(local_db: Arc<LocalDbService>, local_stats: Arc<LocalUserStatsService>) -> Self {
        Self {
            local_db,
            local_stats,
        }
    }

    pub async fn is_password_set_for_self(&self) -> Result<bool, String> {
        let current_email = config::keys::get_user_email(self.local_db.clone()).await?;

        self.is_password_set_for_user(current_email).await
    }

    /// Returns true if the user exists
    pub async fn is_password_set_for_user(&self, user_email: String) -> Result<bool, String> {
        let login_table = self.local_stats.stats_db.login_info_table();
        let result = login_table.get_user_credentials(user_email).await?;

        Ok(result.is_some())
    }

    /// Set the password for the current user with this email
    pub async fn set_password(&self, password: String) -> Result<(), String> {
        let current_email = config::keys::get_user_email(self.local_db.clone()).await?;

        let login_table = self.local_stats.stats_db.login_info_table();

        let result = self.hash_password(password);
        login_table
            .set_user_password(current_email, result.password_hash, result.salt)
            .await?;

        Ok(())
    }

    pub fn hash_password(&self, password: String) -> PasswordHashResult {
        // Generate a random salt
        let salt = SaltString::generate(&mut OsRng);

        // Create an Argon2 instance with default parameters
        let argon2 = Argon2::default();

        // Hash the password - this returns a PasswordHash that includes salt and hash
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .expect("Failed to hash password");

        // Store the salt string for separate storage
        let salt_string = salt.to_string();

        // Store the full password hash string (which includes salt and parameters)
        let password_hash_string = password_hash.to_string();

        PasswordHashResult {
            password_hash: password_hash_string,
            salt: salt_string,
        }
    }

    pub async fn verify_password_for_user(
        &self,
        user_email: String,
        password: String,
    ) -> Result<bool, String> {
        let login_table = self.local_stats.stats_db.login_info_table();
        let result = login_table.get_user_credentials(user_email).await?;
        if result.is_none() {
            return Err("User not found".to_string());
        }
        let result = result.unwrap();
        Ok(self.verify_password(password, result.password_hash, result.salt))
    }

    pub async fn set_temp_password_for_user(&self, user_email: String) -> Result<(), String> {
        let login_table = self.local_stats.stats_db.login_info_table();
        let result = self.hash_password(TEMP_PASSWORD.to_string());
        login_table
            .set_user_password(user_email, result.password_hash, result.salt)
            .await?;
        Ok(())
    }

    /// Returns true if the passwords match
    fn verify_password(
        &self,
        password: String,
        stored_hash: String,
        _stored_salt: String, // Not needed since hash includes salt, but kept for API compatibility
    ) -> bool {
        // Parse the stored hash (which includes salt and parameters)
        let parsed_hash = match PasswordHash::new(&stored_hash) {
            Ok(h) => h,
            Err(_) => return false,
        };

        // Create an Argon2 instance and verify the password
        let argon2 = Argon2::default();
        argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    }
}
