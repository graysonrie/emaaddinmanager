use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "user_stats")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub user_email: String,
    pub user_name: String,
    #[sea_orm(column_type = "JsonBinary")]
    pub published_addins: Json,
    #[sea_orm(column_type = "JsonBinary")]
    pub installed_addins: Json,
    #[sea_orm(column_type = "JsonBinary")]
    pub disciplines: Json,
    pub date_added: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match *self {}
    }
}

impl ActiveModelBehavior for ActiveModel {}
