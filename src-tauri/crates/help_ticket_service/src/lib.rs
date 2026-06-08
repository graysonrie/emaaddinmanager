use std::path::{Path, PathBuf};

#[cfg(test)]
mod tests;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserHelpTicketConfig {
    pub version: String,
    pub ticket_ids: Vec<String>,
}

pub struct HelpTicketService {
    addins_registry_path: PathBuf,
}

impl HelpTicketService {
    pub fn new(addins_registry_path: impl AsRef<Path>) -> Self {
        Self {
            addins_registry_path: addins_registry_path.as_ref().into(),
        }
    }
}
