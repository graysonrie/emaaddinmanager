pub mod models;

pub use enums::*;
pub use models::*;

use std::sync::Arc;

use crate::{constants::Fut, services::admin::addin_exporter::models::*};
use models::*;
mod enums;
pub use enums::*;

pub type AsyncAddinsRegistryServiceType = Arc<dyn AddinsRegistry + Send + Sync + 'static>;
pub trait AddinsRegistry {
    fn get_addins(&'_ self) -> Fut<'_, Result<Vec<AddinModel>, GetAddinsError>>;

    fn install_addin(
        &'_ self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Fut<'_, Result<(), InstallAddinError>>;

    fn delist_addin(&'_ self, addin: AddinModel) -> Fut<'_, Result<(), DelistAddinError>>;

    fn add_category(&'_ self, full_category_path: &str) -> Fut<'_, Result<(), AddCategoryError>>;

    fn get_categories(&'_ self) -> Fut<'_, Result<Vec<CategoryModel>, GetCategoriesError>>;
}
