use crate::models::*;
use tauri::State;

use crate::HelpTicketService;

type HelpTicketServiceState<'a> = State<'a, HelpTicketService>;

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
