use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UserStatsModel {
    pub total_addins: u32,
    pub published_addins: u32,
    pub updated_addins: u32,
    pub categories_count: u32,
    pub last_publish_date: Option<String>,
}

