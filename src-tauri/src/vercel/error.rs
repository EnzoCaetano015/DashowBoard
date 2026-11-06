use chrono::{DateTime, Utc};
use reqwest::header::HeaderMap;
use reqwest::StatusCode;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
#[error("{message}")]
pub struct VercelError {
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

impl VercelError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_owned(),
            message: message.to_owned(),
            reset_at: None,
        }
    }

    pub fn keyring(_error: keyring::Error) -> Self {
        Self::new(
            "VERCEL_COFRE_INDISPONIVEL",
            "Unable to access the system credential vault.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new("VERCEL_TIMEOUT", "Vercel took too long to respond.");
        }
        if error.is_connect() {
            return Self::new(
                "VERCEL_SEM_CONEXAO",
                "Unable to connect to Vercel. Check your internet connection.",
            );
        }
        Self::new("VERCEL_INDISPONIVEL", "Vercel is currently unavailable.")
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "VERCEL_TOKEN_EXPIRADO",
                "The Vercel token has expired. Replace it to continue.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "VERCEL_TOKEN_INVALIDO",
                "The supplied token is invalid or has been revoked.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            StatusCode::FORBIDDEN if header_u32(headers, "x-ratelimit-remaining") == Some(0) => {
                Self::rate_limit(headers)
            }
            StatusCode::FORBIDDEN => Self::new(
                "VERCEL_SEM_PERMISSAO",
                "The token does not have permission to access this Vercel resource.",
            ),
            status if status.is_server_error() => {
                Self::new("VERCEL_INDISPONIVEL", "Vercel is currently unavailable.")
            }
            _ => Self::new(
                "VERCEL_ERRO_DESCONHECIDO",
                "Unable to complete the Vercel operation.",
            ),
        }
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "VERCEL_RATE_LIMIT".to_owned(),
            message: "The Vercel rate limit has been reached.".to_owned(),
            reset_at: header_reset(headers),
        }
    }
}

fn header_u32(headers: &HeaderMap, name: &str) -> Option<u32> {
    headers.get(name)?.to_str().ok()?.parse().ok()
}

fn header_reset(headers: &HeaderMap) -> Option<String> {
    let timestamp = headers
        .get("x-ratelimit-reset")?
        .to_str()
        .ok()?
        .parse::<i64>()
        .ok()?;
    DateTime::<Utc>::from_timestamp(timestamp, 0).map(|date| date.to_rfc3339())
}
