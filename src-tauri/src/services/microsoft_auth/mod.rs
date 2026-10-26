pub mod tauri_exports;

use std::sync::{Arc, OnceLock};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use oauth2::basic::BasicClient;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, CsrfToken, EndpointNotSet, EndpointSet,
    PkceCodeChallenge, RedirectUrl, RefreshToken, Scope, TokenResponse, TokenUrl,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

use crate::constants::{azure_audience, azure_client_id, azure_tenant_id};
use crate::services::local_db::service::LocalDbService;

pub const SIGN_IN_REQUIRED: &str = "Microsoft sign-in required";

const SESSION_KEY: &str = "microsoftSession";
const SIGN_IN_TIMEOUT: Duration = Duration::from_secs(5 * 60);
const REDIRECT_PATH: &str = "/callback";

#[derive(Clone, Serialize, Deserialize)]
struct StoredSession {
    access_token: String,
    refresh_token: String,
    expires_at_unix: i64,
    #[serde(default = "default_redirect_uri")]
    redirect_uri: String,
}

fn default_redirect_uri() -> String {
    format!("http://127.0.0.1{REDIRECT_PATH}")
}

fn redirect_uri_for_port(port: u16) -> String {
    format!("http://127.0.0.1:{port}{REDIRECT_PATH}")
}

pub async fn sign_in_with_microsoft(
    local_db: State<'_, Arc<LocalDbService>>,
) -> Result<(), String> {
    let session = interactive_sign_in().await?;
    save_session(local_db.inner().clone(), &session).await
}

pub async fn sign_out(local_db: State<'_, Arc<LocalDbService>>) -> Result<(), String> {
    clear_session(local_db.inner().clone()).await
}

pub async fn access_token(
    local_db: Arc<LocalDbService>,
    force_refresh: bool,
) -> Result<String, String> {
    let _guard = token_lock().lock().await;
    let Some(session) = load_session(&local_db).await? else {
        return Err(SIGN_IN_REQUIRED.to_string());
    };
    if session.refresh_token.is_empty() {
        return Err(SIGN_IN_REQUIRED.to_string());
    }
    if !force_refresh
        && !session.access_token.is_empty()
        && now_unix() + 60 < session.expires_at_unix
    {
        return Ok(session.access_token);
    }

    match refresh_session(&session).await {
        Ok(updated) => {
            let access_token = updated.access_token.clone();
            save_session(local_db, &updated).await?;
            Ok(access_token)
        }
        Err(RefreshFailure::Rejected) => {
            let _ = clear_session(local_db).await;
            Err(SIGN_IN_REQUIRED.to_string())
        }
        Err(RefreshFailure::Unavailable(message)) => Err(message),
    }
}

pub async fn clear_session(local_db: Arc<LocalDbService>) -> Result<(), String> {
    local_db.kv_store_table().delete_secret(SESSION_KEY).await
}

fn token_lock() -> &'static tokio::sync::Mutex<()> {
    static LOCK: OnceLock<tokio::sync::Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| tokio::sync::Mutex::new(()))
}

async fn load_session(local_db: &Arc<LocalDbService>) -> Result<Option<StoredSession>, String> {
    local_db.kv_store_table().get_secret(SESSION_KEY).await
}

async fn save_session(
    local_db: Arc<LocalDbService>,
    session: &StoredSession,
) -> Result<(), String> {
    local_db
        .kv_store_table()
        .set_secret(SESSION_KEY, session)
        .await
}

enum RefreshFailure {
    Rejected,
    Unavailable(String),
}

async fn refresh_session(session: &StoredSession) -> Result<StoredSession, RefreshFailure> {
    let client = oauth_client(&session.redirect_uri).map_err(RefreshFailure::Unavailable)?;
    let http = token_http_client().map_err(RefreshFailure::Unavailable)?;
    let refresh_token = RefreshToken::new(session.refresh_token.clone());
    let mut request = client.exchange_refresh_token(&refresh_token);
    for scope in delegated_scopes() {
        request = request.add_scope(Scope::new(scope));
    }
    let token = request
        .request_async(&http)
        .await
        .map_err(|err| match err {
            oauth2::RequestTokenError::Request(source) => {
                RefreshFailure::Unavailable(format!("Could not reach Microsoft sign-in: {source}"))
            }
            _ => RefreshFailure::Rejected,
        })?;
    stored_from_token(
        token,
        Some(session.refresh_token.clone()),
        session.redirect_uri.clone(),
    )
    .map_err(|_| RefreshFailure::Rejected)
}

async fn interactive_sign_in() -> Result<StoredSession, String> {
    let (listener, port) = bind_loopback().await?;
    let redirect_uri = redirect_uri_for_port(port);
    let client = oauth_client(&redirect_uri)?;
    let (challenge, verifier) = PkceCodeChallenge::new_random_sha256();
    let mut authorization = client.authorize_url(CsrfToken::new_random);
    for scope in delegated_scopes() {
        authorization = authorization.add_scope(Scope::new(scope));
    }
    let (url, csrf) = authorization.set_pkce_challenge(challenge).url();
    opener::open(url.as_str()).map_err(|err| format!("Could not open the browser: {err}"))?;
    let code = wait_for_code(&listener, csrf.secret()).await?;
    let http = token_http_client()?;
    let token = client
        .exchange_code(AuthorizationCode::new(code))
        .set_pkce_verifier(verifier)
        .request_async(&http)
        .await
        .map_err(|err| format!("Microsoft sign-in failed: {err}"))?;
    stored_from_token(token, None, redirect_uri)
}

fn stored_from_token(
    token: impl TokenResponse,
    previous_refresh: Option<String>,
    redirect_uri: String,
) -> Result<StoredSession, String> {
    let refresh_token = token
        .refresh_token()
        .map(|value| value.secret().to_string())
        .or(previous_refresh)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            "Microsoft did not return a refresh token. Grant the offline_access scope.".to_string()
        })?;
    let expires_in = token.expires_in().unwrap_or(Duration::from_secs(3600));
    let expires_at_unix = now_unix().saturating_add(expires_in.as_secs() as i64);
    Ok(StoredSession {
        access_token: token.access_token().secret().to_string(),
        refresh_token,
        expires_at_unix,
        redirect_uri,
    })
}

fn oauth_client(
    redirect_uri: &str,
) -> Result<
    BasicClient<EndpointSet, EndpointNotSet, EndpointNotSet, EndpointNotSet, EndpointSet>,
    String,
> {
    let tenant = azure_tenant_id();
    let auth_url = AuthUrl::new(format!(
        "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
    ))
    .map_err(|err| err.to_string())?;
    let token_url = TokenUrl::new(format!(
        "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
    ))
    .map_err(|err| err.to_string())?;
    let redirect = RedirectUrl::new(redirect_uri.to_string()).map_err(|err| err.to_string())?;
    Ok(
        BasicClient::new(ClientId::new(azure_client_id().to_string()))
            .set_auth_uri(auth_url)
            .set_token_uri(token_url)
            .set_redirect_uri(redirect),
    )
}

fn delegated_scopes() -> Vec<String> {
    vec![
        "openid".to_string(),
        "profile".to_string(),
        "email".to_string(),
        "offline_access".to_string(),
        format!("{}/access_as_user", azure_audience().trim_end_matches('/')),
    ]
}

fn token_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|err| err.to_string())
}

fn now_unix() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

async fn bind_loopback() -> Result<(TcpListener, u16), String> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|err| format!("Could not listen for the Microsoft redirect: {err}"))?;
    let port = listener.local_addr().map_err(|err| err.to_string())?.port();
    Ok((listener, port))
}

async fn wait_for_code(listener: &TcpListener, expected_state: &str) -> Result<String, String> {
    let deadline = Instant::now() + SIGN_IN_TIMEOUT;
    loop {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            return Err("Microsoft sign-in timed out".to_string());
        }
        let accepted = accept_redirect(listener, remaining).await?;
        let mut stream = match accepted {
            Some(stream) => stream,
            None => return Err("Microsoft sign-in timed out".to_string()),
        };
        let request = read_http_request(&mut stream).await.unwrap_or_default();
        let _ = write_browser_page(&mut stream).await;
        if let Some(outcome) = callback_outcome(&request, expected_state) {
            return outcome;
        }
    }
}

async fn accept_redirect(
    listener: &TcpListener,
    timeout: Duration,
) -> Result<Option<TcpStream>, String> {
    let accepted = tokio::time::timeout(timeout, listener.accept()).await;
    match accepted {
        Ok(Ok((stream, _))) => Ok(Some(stream)),
        Ok(Err(err)) => Err(format!("Could not accept the Microsoft redirect: {err}")),
        Err(_) => Ok(None),
    }
}

async fn read_http_request(stream: &mut TcpStream) -> Result<String, String> {
    let mut buffer = Vec::new();
    let mut chunk = [0u8; 1024];
    while buffer.len() < 16 * 1024 {
        let read = tokio::time::timeout(Duration::from_secs(5), stream.read(&mut chunk))
            .await
            .map_err(|_| "Timed out reading the Microsoft redirect".to_string())?
            .map_err(|err| err.to_string())?;
        if read == 0 {
            break;
        }
        buffer.extend_from_slice(&chunk[..read]);
        if buffer.windows(4).any(|window| window == b"\r\n\r\n") {
            break;
        }
    }
    String::from_utf8(buffer).map_err(|_| "Microsoft redirect was not text".to_string())
}

async fn write_browser_page(stream: &mut TcpStream) -> Result<(), String> {
    let body = "<!DOCTYPE html><html><body><p>You can close this window and return to EMA Addin Launcher.</p></body></html>";
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    stream
        .write_all(response.as_bytes())
        .await
        .map_err(|err| err.to_string())
}

fn callback_outcome(request: &str, expected_state: &str) -> Option<Result<String, String>> {
    let path = request.lines().next()?.split_whitespace().nth(1)?;
    if !path.starts_with("/callback") {
        return None;
    }
    let query = path.split_once('?').map(|(_, query)| query).unwrap_or("");
    let state = query_param(query, "state");
    if state.as_deref() != Some(expected_state) {
        return Some(Err(
            "Microsoft sign-in response did not match this request".to_string()
        ));
    }
    if let Some(description) = query_param(query, "error_description") {
        return Some(Err(format!("Microsoft sign-in failed: {description}")));
    }
    if query_param(query, "error").is_some() {
        return Some(Err("Microsoft sign-in was cancelled".to_string()));
    }
    match query_param(query, "code") {
        Some(code) if !code.is_empty() => Some(Ok(code)),
        _ => Some(Err("Microsoft sign-in did not return a code".to_string())),
    }
}

fn query_param(query: &str, key: &str) -> Option<String> {
    query.split('&').find_map(|pair| {
        let (name, value) = pair.split_once('=').unwrap_or((pair, ""));
        if name == key {
            Some(percent_decode(value))
        } else {
            None
        }
    })
}

fn percent_decode(value: &str) -> String {
    let mut decoded = Vec::new();
    let bytes = value.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        match bytes[index] {
            b'+' => {
                decoded.push(b' ');
                index += 1;
            }
            b'%' if index + 2 < bytes.len() => {
                let hex = &value[index + 1..index + 3];
                if let Ok(byte) = u8::from_str_radix(hex, 16) {
                    decoded.push(byte);
                    index += 3;
                } else {
                    decoded.push(b'%');
                    index += 1;
                }
            }
            byte => {
                decoded.push(byte);
                index += 1;
            }
        }
    }
    String::from_utf8_lossy(&decoded).into_owned()
}
