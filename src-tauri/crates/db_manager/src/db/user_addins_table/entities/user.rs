use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "user_addins")]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub user_email: String,
    /// Type: Vec<String> : Fallback property incase we cannot fetch based on addin paths
    pub allowed_addin_ids: serde_json::Value,
    /// Type: Vec<String> : Should be relative paths into the addins registry, such as "All Versions/SomeAddin"
    pub allowed_addin_paths: serde_json::Value,
    /// Type: Vec<String> : Relative paths into the addins registry that should be blocked for this user
    pub blocked_addin_paths: serde_json::Value,
    pub discipline: String,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}
impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        panic!("No relations")
    }
}
impl ActiveModelBehavior for ActiveModel {}
