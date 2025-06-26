use crate::services::addins_registry::models::addin_model::AddinModel;

pub enum RegistryLocation {
    Local(String),
    Other,
}

pub struct AddinsRegistryService {
    location: RegistryLocation,
}

impl AddinsRegistryService {
    pub fn new(location: RegistryLocation) -> Self {
        Self { location }
    }
    pub fn get_addins(&self) -> Vec<AddinModel> {

    }
}
