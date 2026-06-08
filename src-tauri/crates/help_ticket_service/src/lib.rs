use std::path::{Path, PathBuf};

use crate::models::*;

pub mod config;
pub mod models;

#[cfg(test)]
mod tests;

const DURATION_TO_PURGE_CLOSED_TICKETS: chrono::Duration = chrono::Duration::days(3);

pub struct HelpTicketService {
    addins_registry_path: String,
}

impl HelpTicketService {
    pub fn new(addins_registry_path: impl AsRef<Path>) -> Self {
        Self {
            addins_registry_path: addins_registry_path.as_ref().to_string_lossy().into_owned(),
        }
    }

    /// Adds a new help ticket to the service
    /// Returns the ID of the new ticket
    pub fn create_ticket(&self, request: CreateHelpTicketRequest) -> Result<String, anyhow::Error> {
        let mut config = config::load_config()?;
        let ticket_id = uuid::Uuid::new_v4().to_string();
        let ticket = HelpTicketInfo {
            id: ticket_id.clone(),
            title: request.title,
            for_addin: request.for_addin,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            closed_at: None,
            opened_by_user: request.opened_by_user,
            assigned_to_user: request.assigned_to_user,
            messages: Vec::new(),
            status: HelpTicketStatus::Open,
        };

        self.create_new_help_ticket(&ticket)?;

        config.ticket_ids.push(ticket_id.clone());
        config::save_config(&config)?;
        Ok(ticket_id)
    }

    /// Returns the path to the directory where help tickets are stored, creating it if it doesn't exist
    fn help_tickets_dir(&self) -> Result<PathBuf, anyhow::Error> {
        let path = Path::new(&self.addins_registry_path).join("HelpTickets");
        if !path.exists() {
            std::fs::create_dir_all(&path)?;
        }
        Ok(path)
    }

    fn create_new_help_ticket(&self, ticket: &HelpTicketInfo) -> anyhow::Result<()> {
        let path = self.help_tickets_dir()?;

        let ticket_dir = path.join(ticket.id.clone());
        if !ticket_dir.exists() {
            std::fs::create_dir_all(&ticket_dir)?;
        }

        // Save the JSON file
        let ticket_json_path = ticket_dir.join("info.json");
        std::fs::write(ticket_json_path, serde_json::to_string_pretty(ticket)?)?;

        Ok(())
    }

    fn create_help_ticket_message(&self, message: &HelpTicketMessage) -> Result<(), anyhow::Error> {
        let path = self.help_tickets_dir()?;
        let ticket_dir = path.join(message.help_ticket_id.clone());
        let message_json_path = ticket_dir.join(format!("{}.json", message.id));
        std::fs::write(message_json_path, serde_json::to_string_pretty(message)?)?;
        Ok(())
    }

    pub fn add_message(&self, request: AddHelpTicketMessageRequest) -> Result<(), anyhow::Error> {
        let ticket_dir = self
            .help_tickets_dir()?
            .join(request.help_ticket_id.clone());
        if !ticket_dir.exists() {
            return Err(anyhow::anyhow!("Ticket not found"));
        }
        let mut relative_image_paths = Vec::new();
        // Copy the images to the ticket directory
        for path in request.absolute_image_paths {
            let relative_path = std::path::Path::new(&path)
                .strip_prefix(&self.addins_registry_path)
                .map_err(|e| anyhow::anyhow!(e))?
                .to_string_lossy()
                .into_owned();
            relative_image_paths.push(relative_path.clone());
            let ticket_image_path = ticket_dir.join(relative_path);
            std::fs::copy(path, ticket_image_path)?;
        }

        let message = HelpTicketMessage {
            id: uuid::Uuid::new_v4().to_string(),
            from_user: request.from_user,
            help_ticket_id: request.help_ticket_id.clone(),
            message: request.message,
            created_at: chrono::Utc::now(),
            relative_image_paths,
        };

        self.create_help_ticket_message(&message)?;

        Ok(())
    }

    pub fn get_ticket_with_id(&self, id: &str) -> Result<LoadedHelpTicket, anyhow::Error> {
        let ticket_dir = self.help_tickets_dir()?.join(id);
        if !ticket_dir.exists() {
            return Err(anyhow::anyhow!("Ticket not found"));
        }
        let ticket_json = std::fs::read_to_string(ticket_dir.join("info.json"))?;
        let ticket_info: HelpTicketInfo = serde_json::from_str(&ticket_json)?;

        let files_in_ticket_dir = std::fs::read_dir(ticket_dir.clone())?.flatten();
        let mut loaded_messages = Vec::new();
        for file in files_in_ticket_dir {
            let file_name = file.file_name();
            let file_extension = file_name
                .as_os_str()
                .to_str()
                .and_then(|name| std::path::Path::new(name).extension())
                .and_then(|ext| ext.to_str())
                .unwrap_or_default();
            if file_extension == "json" {
                // skip if it's the info.json file

                if file_name == "info.json" {
                    continue;
                }

                let message_json = std::fs::read_to_string(file.path())?;
                let message: HelpTicketMessage = serde_json::from_str(&message_json)?;
                loaded_messages.push(LoadedHelpTicketMessage {
                    from_user: message.from_user,
                    message: message.message,
                    created_at: message.created_at,
                    absolute_image_paths: message
                        .relative_image_paths
                        .iter()
                        .map(|path| ticket_dir.join(path).to_string_lossy().into_owned())
                        .collect(),
                });
            }
        }
        let loaded_ticket = LoadedHelpTicket {
            title: ticket_info.title,
            opened_by_user: ticket_info.opened_by_user,
            assigned_to_user: ticket_info.assigned_to_user,
            created_at: ticket_info.created_at,
            updated_at: ticket_info.updated_at,
            closed_at: ticket_info.closed_at,
            status: ticket_info.status,
            for_addin: ticket_info.for_addin,
            messages: loaded_messages,
        };
        Ok(loaded_ticket)
    }

    /// Returns a list of all the help ticket previews. Should be used for the admin panel.
    pub fn get_ticket_previews(&self) -> Result<Vec<HelpTicketPreview>, anyhow::Error> {
        let ticket_dir = self.help_tickets_dir()?;
        let files_in_ticket_dir = std::fs::read_dir(ticket_dir.clone())?.flatten();
        let mut ticket_previews = Vec::new();
        for file in files_in_ticket_dir {
            let entry = file.path();

            if entry.is_file() {
                continue;
            }
            // Get the info.json file
            let info_json = std::fs::read_to_string(entry.join("info.json"))?;
            let info: HelpTicketInfo = serde_json::from_str(&info_json)?;
            ticket_previews.push(HelpTicketPreview {
                id: info.id,
                from_user: info.opened_by_user,
                title: info.title,
                for_addin: info.for_addin,
                created_at: info.created_at,
                status: info.status,
                assigned_to_user: info.assigned_to_user,
            });
        }
        Ok(ticket_previews)
    }

    /// Deletes closed tickets that are older than the duration specified in DURATION_TO_PURGE_CLOSED_TICKETS
    pub fn purge_closed_tickets(
        &self,
        now: chrono::DateTime<chrono::Utc>,
    ) -> Result<(), anyhow::Error> {
        let ticket_dir = self.help_tickets_dir()?;
        let files_in_ticket_dir = std::fs::read_dir(ticket_dir.clone())?.flatten();
        for file in files_in_ticket_dir {
            let entry = file.path();
            if entry.is_file() {
                continue;
            }
            let info_json = std::fs::read_to_string(entry.join("info.json"))?;
            let info: HelpTicketInfo = serde_json::from_str(&info_json)?;
            if !matches!(
                info.status,
                HelpTicketStatus::Closed | HelpTicketStatus::Resolved | HelpTicketStatus::Rejected
            ) {
                continue;
            }
            let Some(closed_at) = info.closed_at else {
                continue;
            };
            if now.signed_duration_since(closed_at) < DURATION_TO_PURGE_CLOSED_TICKETS {
                continue;
            }
            if entry.exists() {
                std::fs::remove_dir_all(entry)?;
            }
        }
        Ok(())
    }
}
