pub const APP_NAME: &str = "EmaAddinManager";
// pub const TEST_ADDINS_REGISTRY_PATH: &str =
//     "C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry";
// TODO: ensure changed back
pub const ADDINS_REGISTRY_PATH: &str = "S:\\BasesRevitAddinsRegistry";

pub const TEMP_PASSWORD: &str = "temp1234";

/// Default base URL of the standalone stats server. Can be overridden at
/// runtime with the `STATS_SERVER_URL` environment variable.
pub const DEFAULT_STATS_SERVER_URL: &str = "https://ema-stats-api.onrender.com";

/// Returns the configured stats server base URL (env override or default).
pub fn stats_server_url() -> String {
    std::env::var("STATS_SERVER_URL").unwrap_or_else(|_| DEFAULT_STATS_SERVER_URL.to_string())
}

/// Returns the API key sent to the stats server in the `X-API-Key` header.
///
/// Read from the `STATS_SERVER_API_KEY` environment variable, falling back to
/// the development default that matches the server's `.env.example`.
pub fn stats_server_api_key() -> String {
    std::env::var("STATS_SERVER_API_KEY").unwrap_or_else(|_| {
        "HZntNvUSqnNBx3ti8RkmTtGfNmooLbAUDC4ui6hm4KqC8iuqwD8coH8LV0VwZwjS".to_string()
    })
}
