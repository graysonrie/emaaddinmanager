use std::sync::Arc;

use crate::{config, models::*};
use tauri::State;

use crate::HelpTicketService;

type HelpTicketServiceState<'a> = State<'a, Arc<HelpTicketService>>;

#[tauri::command]
pub fn create_ticket(
    state: HelpTicketServiceState,
    request: CreateHelpTicketRequest,
) -> Result<String, String> {
    state.create_ticket(request).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_ticket_previews(
    state: HelpTicketServiceState,
) -> Result<Vec<HelpTicketPreview>, String> {
    state.get_ticket_previews().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_owned_ticket_previews(
    state: HelpTicketServiceState,
) -> Result<Vec<HelpTicketPreview>, String> {
    let config = config::load_config().map_err(|e| e.to_string())?;
    state
        .get_ticket_previews_with_ids(config.ticket_ids)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_message(
    state: HelpTicketServiceState,
    request: AddHelpTicketMessageRequest,
) -> Result<(), String> {
    state.add_message(request).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_ticket_with_id(
    state: HelpTicketServiceState,
    id: String,
) -> Result<LoadedHelpTicket, String> {
    state.get_ticket_with_id(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_ticket_status(
    state: HelpTicketServiceState,
    id: String,
    status: HelpTicketStatus,
) -> Result<(), String> {
    state
        .set_ticket_status(&id, status)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn purge_closed_tickets(state: HelpTicketServiceState) -> Result<(), String> {
    let now = chrono::Utc::now();
    state.purge_closed_tickets(now).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_nonexistant_tickets_from_config(state: HelpTicketServiceState) -> Result<(), String> {
    config::remove_nonexistant_tickets_from_config(&state).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_help_ticket_image(
    absolute_path: String,
) -> Result<(Vec<u8>, String), String> {
    let path = std::path::Path::new(&absolute_path);
    let mime_type = match path.extension().and_then(|ext| ext.to_str()) {
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("png") => "image/png",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        _ => {
            return Err(format!(
                "Unsupported image format for path: {absolute_path}"
            ));
        }
    };

    let image_data = std::fs::read(path).map_err(|e| e.to_string())?;
    Ok((image_data, mime_type.to_string()))
}
