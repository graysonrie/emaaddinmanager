mod requests;
mod responses;
pub use requests::*;
pub use responses::*;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HelpTicketInfo {
    pub id: String,
    pub title: String,
    /// The user who opened the ticket. Ideally, their email
    pub opened_by_user: String,
    /// The user who is assigned to the ticket. Ideally, their email
    pub assigned_to_user: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub closed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub status: HelpTicketStatus,
    /// For which addin is the ticket being created for. Example: "All Versions/EMA_ELECTRICAL"
    pub for_addin: String,
    /// The messages in the help ticket, in chronological order
    pub messages: Vec<HelpTicketMessage>,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HelpTicketMessage {
    pub id: String,
    /// The user who sent the message. Ideally, their email
    pub from_user: String,
    /// The ID of the help ticket that the message is for
    pub help_ticket_id: String,
    /// The message content
    pub message: String,
    /// The timestamp of when the message was created
    pub created_at: chrono::DateTime<chrono::Utc>,
    /// The relative paths to the images in the message. Images are stored in the same directory as the help ticket
    pub relative_image_paths: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Clone, Debug)]
pub enum HelpTicketStatus {
    Open,
    Closed,
    InProgress,
    Resolved,
    Rejected,
}
