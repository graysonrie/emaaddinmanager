use super::*;

use web_server_ver::constants::Fut;
use web_server_ver::services::addins_registry::*;
use web_server_ver::services::admin::addin_exporter::*;
pub struct WebAddinsRegistryService {}

impl AddinsRegistry for WebAddinsRegistryService {
    fn get_addins(&self) -> Fut<Result<Vec<AddinModel>, GetAddinsError>> {
        todo!()
    }

    fn install_addin(
        &self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Fut<Result<(), InstallAddinError>> {
        todo!()
    }

    fn delist_addin(&self, addin: AddinModel) -> Fut<Result<(), DelistAddinError>> {
        todo!()
    }

    fn add_category(&self, full_category_path: &str) -> Fut<Result<(), AddCategoryError>> {
        todo!()
    }

    fn get_categories(&self) -> Fut<Result<Vec<CategoryModel>, GetCategoriesError>> {
        todo!()
    }
}
