use crate::constants::Fut;
use crate::services::addin_exporter::models::category_model::CategoryModel;
use crate::services::addins_registry::models::addin_model::AddinModel;
use crate::services::addins_registry::services::local_registry::LocalAddinsRegistryService;
use crate::services::addins_registry::services::web_registry::WebAddinsRegistryService;
use crate::services::addins_registry::services::AddinsRegistry;
use crate::services::local_db::service::LocalDbService;
use std::sync::Arc;

pub struct AddinsRegistryService {
    local_registry: Option<LocalAddinsRegistryService>,
    web_registry: Option<WebAddinsRegistryService>,
}

impl AddinsRegistryService {
    pub fn new_local(db: Arc<LocalDbService>) -> Self {
        Self {
            local_registry: Some(LocalAddinsRegistryService::new(db)),
            web_registry: None,
        }
    }
    fn get_service(&self) -> &dyn AddinsRegistry {
        if let Some(ref local_registry) = self.local_registry {
            return local_registry;
        }

        if let Some(ref web_registry) = self.web_registry {
            return web_registry;
        }
        panic!();
    }
}

impl AddinsRegistry for AddinsRegistryService {
    fn get_addins(&self) -> Fut<Result<Vec<AddinModel>, super::services::GetAddinsError>> {
        self.get_service().get_addins()
    }

    fn install_addin(
        &self,
        addin: AddinModel,
        for_revit_versions: Vec<String>,
    ) -> Fut<Result<(), super::services::InstallAddinError>> {
        self.get_service().install_addin(addin, for_revit_versions)
    }

    fn delist_addin(
        &self,
        addin: AddinModel,
    ) -> Fut<Result<(), super::services::DelistAddinError>> {
        self.get_service().delist_addin(addin)
    }

    fn add_category(
        &self,
        full_category_path: &str,
    ) -> Fut<Result<(), super::services::AddCategoryError>> {
        self.get_service().add_category(full_category_path)
    }

    fn get_categories(
        &self,
    ) -> Fut<Result<Vec<CategoryModel>, super::services::GetCategoriesError>> {
        self.get_service().get_categories()
    }
}
