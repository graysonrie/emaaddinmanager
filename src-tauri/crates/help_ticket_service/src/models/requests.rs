

pub struct CreateHelpTicketRequest {
    pub title: String,
    /// For which addin is the ticket being created for. Example: "All Versions/EMA_ELECTRICAL"
    pub for_addin:String,
    pub opened_by_user: String,
    pub assigned_to_user: Option<String>,
}

pub struct AddHelpTicketMessageRequest {
    pub help_ticket_id: String,
    pub message: String,
    pub from_user: String,
    pub absolute_image_paths: Vec<String>,
}