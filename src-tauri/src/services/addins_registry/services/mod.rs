use std::sync::Arc;

use crate::{
    constants::Fut,
    services::{
        addin_exporter::models::category_model::CategoryModel,
        addins_registry::models::addin_model::AddinModel,
    },
};
mod enums;
pub mod local_registry;
pub mod web_registry;
pub use enums::*;

pub type AsyncAddinsRegistryServiceType = Arc<dyn AddinsRegistry + Send + Sync + 'static>;
pub trait AddinsRegistry {
    fn get_addins(&self) -> Fut<Result<Vec<AddinModel>, GetAddinsError>>;

    fn install_addin(
        &self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Fut<Result<(), InstallAddinError>>;

    fn delist_addin(&self, addin: AddinModel) -> Fut<Result<(), DelistAddinError>>;

    fn add_category(&self, full_category_path: &str) -> Fut<Result<(), AddCategoryError>>;

    fn get_categories(&self) -> Fut<Result<Vec<CategoryModel>, GetCategoriesError>>;
}
