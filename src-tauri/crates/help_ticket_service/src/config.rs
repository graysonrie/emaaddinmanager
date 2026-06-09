use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use crate::{HelpTicketService, models::*};

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TicketWatchState {
    pub updated_at_exact: String,
    pub status: HelpTicketStatus,
    pub message_count: u32,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserHelpTicketConfig {
    pub version: String,
    /// The IDs of the tickets that the user owns
    pub ticket_ids: Vec<String>,
    #[serde(default)]
    pub ticket_watch_states: HashMap<String, TicketWatchState>,
    /// Ticket IDs the admin has already seen; used to detect newly created tickets
    #[serde(default)]
    pub admin_known_ticket_ids: HashSet<String>,
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
            ticket_watch_states: HashMap::new(),
            admin_known_ticket_ids: HashSet::new(),
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

/// Removes any tickets from the config that no longer exist in the service
pub fn remove_nonexistant_tickets_from_config(
    service: &HelpTicketService,
) -> Result<(), anyhow::Error> {
    let mut config = load_config()?;
    let ticket_dir = service.help_tickets_dir()?;

    let mut existing_ticket_ids = HashSet::new();
    for file in std::fs::read_dir(ticket_dir)?.flatten() {
        if file.path().is_file() {
            continue;
        }
        let info_path = file.path().join("info.json");
        if !info_path.exists() {
            continue;
        }
        let info_json = std::fs::read_to_string(&info_path)?;
        let info: HelpTicketInfo = serde_json::from_str(&info_json)?;
        existing_ticket_ids.insert(info.id);
    }

    config
        .ticket_ids
        .retain(|ticket_id| existing_ticket_ids.contains(ticket_id));
    save_config(&config)?;
    Ok(())
}
