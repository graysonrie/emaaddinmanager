use reqwest::{Client, StatusCode};
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::constants::{stats_server_api_key, stats_server_url};

const API_KEY_HEADER: &str = "X-API-Key";

/// Thin HTTP client for the standalone stats server.
///
/// Wraps a `reqwest::Client`, the server base URL, and the shared API key.
/// Every request carries the `X-API-Key` header. Helper methods map a `404`
/// response to `None` and any other non-success status to an `Err`.
#[derive(Clone)]
pub struct StatsApiClient {
    http: Client,
    base_url: String,
    api_key: String,
}

impl StatsApiClient {
    pub fn new() -> Self {
        Self {
            http: Client::new(),
            base_url: stats_server_url().trim_end_matches('/').to_string(),
            api_key: stats_server_api_key(),
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base_url, path)
    }

    /// Pings the server's unauthenticated `/health` endpoint to verify the
    /// stats server is reachable.
    pub async fn health(&self) -> Result<(), String> {
        let resp = self
            .http
            .get(self.url("/health"))
            .send()
            .await
            .map_err(|e| format!("Could not reach stats server at {}: {e}", self.base_url))?;
        Self::error_for_status(resp).await?;
        Ok(())
    }

    /// GET a resource that may not exist. Returns `None` on `404`.
    pub async fn get_opt<T: DeserializeOwned>(&self, path: &str) -> Result<Option<T>, String> {
        let resp = self
            .http
            .get(self.url(path))
            .header(API_KEY_HEADER, &self.api_key)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if resp.status() == StatusCode::NOT_FOUND {
            return Ok(None);
        }
        let resp = Self::error_for_status(resp).await?;
        let value = resp.json::<T>().await.map_err(|e| e.to_string())?;
        Ok(Some(value))
    }

    /// GET a resource that is expected to exist.
    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T, String> {
        let resp = self
            .http
            .get(self.url(path))
            .header(API_KEY_HEADER, &self.api_key)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let resp = Self::error_for_status(resp).await?;
        resp.json::<T>().await.map_err(|e| e.to_string())
    }

    /// POST a body and deserialize the returned resource.
    pub async fn post_json<B: Serialize, T: DeserializeOwned>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T, String> {
        let resp = self
            .http
            .post(self.url(path))
            .header(API_KEY_HEADER, &self.api_key)
            .json(body)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let resp = Self::error_for_status(resp).await?;
        resp.json::<T>().await.map_err(|e| e.to_string())
    }

    /// POST a body where no response payload is expected.
    pub async fn post_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        self.send_no_content(self.http.post(self.url(path)).json(body))
            .await
    }

    /// PUT a body where no response payload is expected.
    pub async fn put_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        self.send_no_content(self.http.put(self.url(path)).json(body))
            .await
    }

    /// PATCH a body where no response payload is expected.
    pub async fn patch_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        self.send_no_content(self.http.patch(self.url(path)).json(body))
            .await
    }

    /// DELETE a resource where no response payload is expected.
    pub async fn delete_no_content(&self, path: &str) -> Result<(), String> {
        self.send_no_content(self.http.delete(self.url(path))).await
    }

    async fn send_no_content(&self, builder: reqwest::RequestBuilder) -> Result<(), String> {
        let resp = builder
            .header(API_KEY_HEADER, &self.api_key)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        Self::error_for_status(resp).await?;
        Ok(())
    }

    /// Turns a non-success HTTP response into a descriptive `Err`, including the
    /// server-provided body when available.
    async fn error_for_status(resp: reqwest::Response) -> Result<reqwest::Response, String> {
        let status = resp.status();
        if status.is_success() {
            return Ok(resp);
        }
        let body = resp.text().await.unwrap_or_default();
        Err(format!("Stats server returned {status}: {body}"))
    }
}

impl Default for StatsApiClient {
    fn default() -> Self {
        Self::new()
    }
}
