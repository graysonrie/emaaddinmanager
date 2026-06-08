use std::path::PathBuf;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserHelpTicketConfig {
    pub version: String,
    /// The IDs of the tickets that the user owns
    pub ticket_ids: Vec<String>,
}

/// Returns the path to the config directory, not the JSON file
pub fn path_to_config() -> Result<PathBuf, anyhow::Error> {
    let appdata_dir = dirs::data_dir().ok_or(anyhow::anyhow!("Failed to get config directory"))?;
    let config_dir = appdata_dir.join("AddinManagerHelpTickets");
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir)?;
    }
    Ok(config_dir)
}

fn path_to_config_file() -> Result<PathBuf, anyhow::Error> {
    let config_dir = path_to_config()?;
    Ok(config_dir.join("help_ticket_service.json"))
}

pub fn load_config() -> Result<UserHelpTicketConfig, anyhow::Error> {
    let config_file = path_to_config_file()?;
    if !config_file.exists() {
        return Ok(UserHelpTicketConfig {
            version: "0.1.0".to_string(),
            ticket_ids: Vec::new(),
        });
    }
    let config = std::fs::read_to_string(&config_file)?;
    Ok(serde_json::from_str(&config)?)
}

pub fn save_config(config: &UserHelpTicketConfig) -> Result<(), anyhow::Error> {
    let config_file = path_to_config_file()?;
    std::fs::write(&config_file, serde_json::to_string(config)?)?;
    Ok(())
}
