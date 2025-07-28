use std::sync::Arc;

use crate::services::{config::keys, local_db::service::LocalDbService};

const SUPER_ADMIN_USER_EMAILS: [&str; 2] = ["grieger@emaengineer.com", "jbright@emaengineer.com"];

const ADMIN_USER_EMAILS: [&str; 4] = [
    "grieger@emaengineer.com",
    "skhadka@emaengineer.com",
    "jbright@emaengineer.com",
    "lcasey@emaengineer.com",
];

pub struct AdminService {
    local_db: Arc<LocalDbService>,
}

impl AdminService {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self { local_db }
    }
    pub async fn is_admin(&self) -> bool {
        let user_email = keys::get_user_email(self.local_db.clone()).await;
        if let Ok(user_email) = user_email {
            return self.is_other_admin(&user_email);
        }
        false
    }
    pub async fn is_super_admin(&self) -> bool {
        let user_email = keys::get_user_email(self.local_db.clone()).await;
        if let Ok(user_email) = user_email {
            return self.is_other_super_admin(&user_email);
        }
        false
    }

    pub fn is_other_super_admin(&self, user_email: &str) -> bool {
        SUPER_ADMIN_USER_EMAILS.contains(&user_email)
    }
    pub fn is_other_admin(&self, user_email: &str) -> bool {
        ADMIN_USER_EMAILS.contains(&user_email)
    }
}
