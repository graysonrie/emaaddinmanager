use std::sync::Arc;

use reqwest::{Client, RequestBuilder, StatusCode};
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::constants::stats_server_url;
use crate::services::local_db::service::LocalDbService;
use crate::services::microsoft_auth::{self, SIGN_IN_REQUIRED};

/// HTTP client for the stats server.
///
/// Every request carries the Microsoft access token. A `401` refreshes the
/// token once and retries. The access token is kept in the local key-value
/// store and is not written to logs.
#[derive(Clone)]
pub struct StatsApiClient {
    http: Client,
    base_url: String,
    local_db: Arc<LocalDbService>,
}

impl StatsApiClient {
    pub fn new(local_db: Arc<LocalDbService>) -> Self {
        Self {
            http: Client::new(),
            base_url: stats_server_url().trim_end_matches('/').to_string(),
            local_db,
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base_url, path)
    }

    /// Pings the authenticated `/ping` endpoint.
    pub async fn ping(&self) -> Result<(), String> {
        let url = self.url("/ping");
        let response = self.send(|http| http.get(&url)).await?;
        Self::error_for_status(response).await?;
        Ok(())
    }

    /// GET a resource that may not exist. Returns `None` on `404`.
    pub async fn get_opt<T: DeserializeOwned>(&self, path: &str) -> Result<Option<T>, String> {
        let url = self.url(path);
        let response = self.send(|http| http.get(&url)).await?;
        if response.status() == StatusCode::NOT_FOUND {
            return Ok(None);
        }
        let response = Self::error_for_status(response).await?;
        let value = response.json::<T>().await.map_err(|err| err.to_string())?;
        Ok(Some(value))
    }

    /// GET a resource that is expected to exist.
    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T, String> {
        let url = self.url(path);
        let response = self.send(|http| http.get(&url)).await?;
        let response = Self::error_for_status(response).await?;
        response.json::<T>().await.map_err(|err| err.to_string())
    }

    /// POST a body and deserialize the returned resource.
    pub async fn post_json<B: Serialize, T: DeserializeOwned>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T, String> {
        let url = self.url(path);
        let response = self.send(|http| http.post(&url).json(body)).await?;
        let response = Self::error_for_status(response).await?;
        response.json::<T>().await.map_err(|err| err.to_string())
    }

    /// POST a body where no response payload is expected.
    pub async fn post_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        let url = self.url(path);
        let response = self.send(|http| http.post(&url).json(body)).await?;
        Self::error_for_status(response).await?;
        Ok(())
    }

    /// PUT a body where no response payload is expected.
    pub async fn put_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        let url = self.url(path);
        let response = self.send(|http| http.put(&url).json(body)).await?;
        Self::error_for_status(response).await?;
        Ok(())
    }

    /// PATCH a body where no response payload is expected.
    pub async fn patch_no_content<B: Serialize>(&self, path: &str, body: &B) -> Result<(), String> {
        let url = self.url(path);
        let response = self.send(|http| http.patch(&url).json(body)).await?;
        Self::error_for_status(response).await?;
        Ok(())
    }

    /// DELETE a resource where no response payload is expected.
    pub async fn delete_no_content(&self, path: &str) -> Result<(), String> {
        let url = self.url(path);
        let response = self.send(|http| http.delete(&url)).await?;
        Self::error_for_status(response).await?;
        Ok(())
    }

    async fn send(
        &self,
        build: impl Fn(&Client) -> RequestBuilder,
    ) -> Result<reqwest::Response, String> {
        let response = self.dispatch(&build, false).await?;
        if response.status() != StatusCode::UNAUTHORIZED {
            return Ok(response);
        }
        let response = self.dispatch(&build, true).await?;
        if response.status() == StatusCode::UNAUTHORIZED {
            let _ = microsoft_auth::clear_session(self.local_db.clone()).await;
            return Err(SIGN_IN_REQUIRED.to_string());
        }
        Ok(response)
    }

    async fn dispatch(
        &self,
        build: &impl Fn(&Client) -> RequestBuilder,
        force_refresh: bool,
    ) -> Result<reqwest::Response, String> {
        let token = microsoft_auth::access_token(self.local_db.clone(), force_refresh).await?;
        build(&self.http)
            .bearer_auth(token)
            .send()
            .await
            .map_err(|err| format!("Could not reach stats server at {}: {err}", self.base_url))
    }

    /// Turns a non-success HTTP response into a descriptive `Err`, including the
    /// server-provided body when available.
    async fn error_for_status(response: reqwest::Response) -> Result<reqwest::Response, String> {
        let status = response.status();
        if status.is_success() {
            return Ok(response);
        }
        let body = response.text().await.unwrap_or_default();
        Err(format!("Stats server returned {status}: {body}"))
    }
}
