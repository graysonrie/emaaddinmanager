use crate::models::HelpTicketStatus;

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadedHelpTicketMessage {
    pub from_user: String,
    pub message: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    /// When loaded, the relative paths will be converted to absolute paths
    /// this is because they are now stored in the same directory as the help ticket
    pub absolute_image_paths: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadedHelpTicket {
    pub title: String,
    pub for_addin: String,
    pub opened_by_user: String,
    pub assigned_to_user: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub closed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub status: HelpTicketStatus,
    pub messages: Vec<LoadedHelpTicketMessage>,
}

/// What will be displayed in the help ticket preview list on the admin panel
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HelpTicketPreview {
    pub id: String,
    pub from_user: String,
    pub title: String,
    pub for_addin: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub status: HelpTicketStatus,
    pub assigned_to_user: Option<String>,
}
