pub const APP_NAME: &str = "EmaAddinManager";

// TODO: ensure changed back
pub const ADDINS_REGISTRY_PATH: &str = "C:\\Users\\GRieger\\Favorites\\BasesRevitAddinsRegistry";
pub const DEFAULT_STATS_SERVER_URL: &str = "http://localhost:8000";
pub const AZURE_TENANT_ID: &str = "5348c269-559a-4adc-9093-0811ef7298be";
pub const AZURE_ALLOWED_CLIENT_ID: &str = "67d72ece-3ae3-40d1-a5ed-20b5ba5f3527";
pub const AZURE_AUDIENCE: &str = "api://d1bc825a-318d-46dc-9cd5-8c7b92ef95a5";

pub fn azure_tenant_id() -> &'static str {
    AZURE_TENANT_ID
}

pub fn azure_client_id() -> &'static str {
    AZURE_ALLOWED_CLIENT_ID
}

pub fn azure_audience() -> &'static str {
    AZURE_AUDIENCE
}

/// Returns the configured stats server base URL (env override or default).
pub fn stats_server_url() -> &'static str {
    DEFAULT_STATS_SERVER_URL
}
