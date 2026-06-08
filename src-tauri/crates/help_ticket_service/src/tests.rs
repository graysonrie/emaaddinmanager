use crate::HelpTicketService;

const TEST_ADDINS_SERVER_PATH: &str = "C:\\Users\\GRieger\\Desktop\\addin_server_test";

#[test]
pub fn add_ticket() {
    let service = HelpTicketService::new(TEST_ADDINS_SERVER_PATH);
}
