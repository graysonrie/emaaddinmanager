use std::path::Path;

use crate::{HelpTicketService, models::*};

const TEST_ADDINS_SERVER_PATH: &str = "addin_server_test";
const TEST_ASSETS_PATH: &str = "test_assets";

fn test_message_1(id: &str) -> AddHelpTicketMessageRequest {
    AddHelpTicketMessageRequest {
        help_ticket_id: id.to_string(),
        message: "Test Message".to_string(),
        from_user: "test@example.com".to_string(),
        absolute_image_paths: Vec::new(),
    }
}

fn test_message_2(id: &str) -> AddHelpTicketMessageRequest {
    AddHelpTicketMessageRequest {
        help_ticket_id: id.to_string(),
        message: "Test Message 2".to_string(),
        from_user: "test2@example.com".to_string(),
        absolute_image_paths: vec![
            Path::new(TEST_ASSETS_PATH)
                .join("test_image1.jpg")
                .to_string_lossy()
                .into_owned(),
            Path::new(TEST_ASSETS_PATH)
                .join("test_image2.png")
                .to_string_lossy()
                .into_owned(),
        ],
    }
}
fn test_ticket() -> CreateHelpTicketRequest {
    CreateHelpTicketRequest {
        title: "Test Ticket".to_string(),
        for_addin: "All Versions/EMA_ELECTRICAL".to_string(),
        opened_by_user: "test@example.com".to_string(),
        assigned_to_user: Some("test2@example.com".to_string()),
    }
}

fn recreate_addin_server_path() {
    if Path::new(TEST_ADDINS_SERVER_PATH).exists() {
        std::fs::remove_dir_all(TEST_ADDINS_SERVER_PATH)
            .expect("Failed to remove addin server path");
    }
    std::fs::create_dir_all(TEST_ADDINS_SERVER_PATH).expect("Failed to create addin server path");

    println!(
        "Addin server path recreated. Full path: {}",
        Path::new(TEST_ADDINS_SERVER_PATH)
            .canonicalize()
            .unwrap()
            .display()
    );
}

#[test]
pub fn create_ticket() {
    recreate_addin_server_path();
    let service = HelpTicketService::new(TEST_ADDINS_SERVER_PATH);

    service
        .create_ticket(test_ticket())
        .expect("Failed to create ticket");
}

#[test]
pub fn purge_closed_tickets() {
    recreate_addin_server_path();
    let service = HelpTicketService::new(TEST_ADDINS_SERVER_PATH);

    let id = service
        .create_ticket(test_ticket())
        .expect("Failed to create ticket");
    service
        .set_ticket_status(&id, HelpTicketStatus::Closed)
        .expect("Failed to set ticket status");
    service
        .purge_closed_tickets(chrono::Utc::now() + chrono::Duration::days(5))
        .expect("Failed to purge closed tickets");
    assert!(
        !Path::new(TEST_ADDINS_SERVER_PATH)
            .join("HelpTickets")
            .join(id)
            .exists()
    );
}

#[test]
pub fn create_ticket_with_messages() {
    recreate_addin_server_path();
    let service = HelpTicketService::new(TEST_ADDINS_SERVER_PATH);

    let id = service
        .create_ticket(test_ticket())
        .expect("Failed to create ticket");

    service
        .add_message(test_message_1(&id))
        .expect("Failed to add message");

    service
        .add_message(test_message_2(&id))
        .expect("Failed to add message");

    let previews = service
        .get_ticket_previews()
        .expect("Failed to get ticket previews");
    println!("Previews: {:?}", previews);
}
