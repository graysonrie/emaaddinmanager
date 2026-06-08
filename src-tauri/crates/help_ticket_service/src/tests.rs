use std::path::Path;

use crate::{HelpTicketService, models::*};

const TEST_ADDINS_SERVER_PATH: &str = "addin_server_test";
const TEST_ASSETS_PATH: &str = "test_assets";

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
        .create_ticket(CreateHelpTicketRequest {
            title: "Test Ticket".to_string(),
            for_addin: "All Versions/EMA_ELECTRICAL".to_string(),
            opened_by_user: "test@example.com".to_string(),
            assigned_to_user: None,
        })
        .expect("Failed to create ticket");
}
