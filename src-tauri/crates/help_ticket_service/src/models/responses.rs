use chrono::{DateTime, Local, Utc};

use crate::models::HelpTicketStatus;

pub fn format_local_datetime(utc: DateTime<Utc>) -> String {
    utc.with_timezone(&Local)
        .format("%Y-%m-%d %l:%M %p")
        .to_string()
}

pub fn format_exact_datetime(utc: DateTime<Utc>) -> String {
    utc.to_rfc3339()
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LoadedHelpTicketMessage {
    pub from_user: String,
    pub message: String,
    pub created_at: String,
    pub created_at_exact: String,
    /// When loaded, the relative paths will be converted to absolute paths
    /// this is because they are now stored in the same directory as the help ticket
    pub absolute_image_paths: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LoadedHelpTicket {
    pub title: String,
    pub for_addin: String,
    pub opened_by_user: String,
    pub assigned_to_user: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub closed_at: Option<String>,
    pub status: HelpTicketStatus,
    pub messages: Vec<LoadedHelpTicketMessage>,
}

/// What will be displayed in the help ticket preview list on the admin panel
#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct HelpTicketPreview {
    pub id: String,
    pub from_user: String,
    pub title: String,
    pub for_addin: String,
    pub created_at: String,
    pub updated_at: String,
    pub status: HelpTicketStatus,
    pub assigned_to_user: Option<String>,
}
