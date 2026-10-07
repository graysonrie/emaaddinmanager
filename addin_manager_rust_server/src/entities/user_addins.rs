use sea_orm::entity::prelude::*;
use sea_orm::sea_query::Expr;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "user_addins")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub user_email: String,
    #[sea_orm(column_type = "JsonBinary")]
    pub allowed_addin_ids: Json,
    #[sea_orm(column_type = "JsonBinary")]
    pub allowed_addin_paths: Json,
    #[sea_orm(
        column_type = "JsonBinary",
        default_expr = "Expr::cust(\"'[]'::jsonb\")"
    )]
    pub blocked_addin_paths: Json,
    pub discipline: String,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match *self {}
    }
}

impl ActiveModelBehavior for ActiveModel {}
