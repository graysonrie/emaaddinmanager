use std::sync::Arc;

use crate::services::{
    addins_registry::models::addin_model::AddinModel,
    admin::addin_exporter::models::category_model::CategoryModel,
};
mod enums;
pub mod local_registry;
use async_trait::async_trait;
pub use enums::*;

pub type AsyncAddinsRegistryServiceType = Arc<dyn AddinsRegistry + Send + Sync + 'static>;

#[async_trait]
pub trait AddinsRegistry {
    async fn get_addins(&self) -> Result<Vec<AddinModel>, GetAddinsError>;

    async fn install_addin(
        &self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Result<(), InstallAddinError>;

    async fn delist_addin(&self, addin: AddinModel) -> Result<(), DelistAddinError>;

    async fn add_category(&self, full_category_path: &str) -> Result<(), AddCategoryError>;

    async fn get_categories(&self) -> Result<Vec<CategoryModel>, GetCategoriesError>;
}
