use std::sync::Arc;

use crate::services::db::service::AppDbService;

// TODO: don't hardcode
const SUPER_ADMIN_USER_EMAILS: [&str; 3] = [
    "grieger@emaengineer.com",
    "jbright@emaengineer.com",
    "skhadka@emaengineer.com",
];

const ADMIN_USER_EMAILS: [&str; 4] = [
    "grieger@emaengineer.com",
    "jbright@emaengineer.com",
    "lcasey@emaengineer.com",
    "skhadka@emaengineer.com",
];

pub struct AdminService {
    local_db: Arc<AppDbService>,
}

impl AdminService {
    pub fn new(local_db: Arc<AppDbService>) -> Self {
        Self { local_db }
    }
    pub async fn is_admin(&self, user_email: &str) -> bool {
        return self.is_other_admin(&user_email);
    }
    pub async fn is_super_admin(&self, user_email: &str) -> bool {
        return self.is_other_super_admin(&user_email);
    }

    pub fn is_other_super_admin(&self, user_email: &str) -> bool {
        SUPER_ADMIN_USER_EMAILS.contains(&user_email)
    }
    pub fn is_other_admin(&self, user_email: &str) -> bool {
        ADMIN_USER_EMAILS.contains(&user_email)
    }
}
