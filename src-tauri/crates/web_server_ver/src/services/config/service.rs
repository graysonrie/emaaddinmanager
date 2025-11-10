pub struct ConfigService {
    addin_registry_path: String,
}

impl ConfigService {
    pub fn get_addins_registry_path(&self) -> &str {
        &self.addin_registry_path
    }
}
