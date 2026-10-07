use std::net::SocketAddr;
use std::num::NonZeroU32;

use axum::extract::ConnectInfo;
use axum::extract::FromRequestParts;
use axum::http::HeaderMap;
use axum::http::request::Parts;
use governor::clock::DefaultClock;
use governor::state::keyed::DefaultKeyedStateStore;
use governor::{Quota, RateLimiter};

use crate::error::AppError;
use crate::state::AppState;

pub type KeyedLimiter = RateLimiter<String, DefaultKeyedStateStore<String>, DefaultClock>;

pub struct IpLimiter {
    inner: KeyedLimiter,
}

impl IpLimiter {
    pub fn per_minute(limit: u32) -> Self {
        let burst = NonZeroU32::new(limit).expect("rate limit is non-zero");
        Self {
            inner: RateLimiter::keyed(Quota::per_minute(burst)),
        }
    }

    pub fn check(&self, ip: &str) -> bool {
        self.inner.check_key(&ip.to_string()).is_ok()
    }
}

pub enum Limit {
    TenPerMinute,
    ThirtyPerMinute,
    SixtyPerMinute,
}

pub struct ClientAddr(pub Option<SocketAddr>);

impl<S> FromRequestParts<S> for ClientAddr
where
    S: Send + Sync,
{
    type Rejection = std::convert::Infallible;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let addr = parts
            .extensions
            .get::<ConnectInfo<SocketAddr>>()
            .map(|info| info.0);
        Ok(ClientAddr(addr))
    }
}

pub fn enforce(
    state: &AppState,
    headers: &HeaderMap,
    addr: Option<SocketAddr>,
    limit: Limit,
) -> Result<(), AppError> {
    let ip = client_ip(headers, addr);
    let allowed = match limit {
        Limit::TenPerMinute => state.limit_10.check(&ip),
        Limit::ThirtyPerMinute => state.limit_30.check(&ip),
        Limit::SixtyPerMinute => state.limit_60.check(&ip),
    };
    if allowed {
        Ok(())
    } else {
        Err(AppError::RateLimited)
    }
}

pub fn client_ip(headers: &HeaderMap, addr: Option<SocketAddr>) -> String {
    if let Some(value) = headers
        .get("x-forwarded-for")
        .and_then(|header| header.to_str().ok())
    {
        if !value.is_empty() {
            let first = value.split(',').next().unwrap_or("");
            return first.trim().to_string();
        }
    }
    addr.map(|socket| socket.ip().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn forwarded_for_uses_the_first_hop() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", " 203.0.113.4, 10.0.0.1".parse().unwrap());
        let addr = "10.1.1.1:1234".parse().unwrap();
        assert_eq!(client_ip(&headers, Some(addr)), "203.0.113.4");
    }

    #[test]
    fn missing_forwarded_for_uses_the_peer_address() {
        let headers = HeaderMap::new();
        let addr = "192.0.2.10:5555".parse().unwrap();
        assert_eq!(client_ip(&headers, Some(addr)), "192.0.2.10");
    }

    #[test]
    fn empty_forwarded_for_uses_the_peer_address() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "".parse().unwrap());
        let addr = "192.0.2.10:5555".parse().unwrap();
        assert_eq!(client_ip(&headers, Some(addr)), "192.0.2.10");
    }
}
