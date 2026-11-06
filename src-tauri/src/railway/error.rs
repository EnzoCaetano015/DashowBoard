use chrono::{DateTime, Duration, Utc};
use reqwest::header::HeaderMap;
use reqwest::StatusCode;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
#[error("{message}")]
pub struct RailwayError {
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
    pub rate_limit: Option<u64>,
    pub rate_limit_remaining: Option<u64>,
}

impl RailwayError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_owned(),
            message: message.to_owned(),
            reset_at: None,
            rate_limit: None,
            rate_limit_remaining: None,
        }
    }

    pub fn keyring(_error: keyring::Error) -> Self {
        Self::new(
            "RAILWAY_COFRE_INDISPONIVEL",
            "Unable to access the system credential vault.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new("RAILWAY_TIMEOUT", "Railway took too long to respond.");
        }
        if error.is_connect() {
            return Self::new(
                "RAILWAY_SEM_CONEXAO",
                "Unable to connect to Railway. Check your internet connection.",
            );
        }
        Self::new("RAILWAY_INDISPONIVEL", "Railway is currently unavailable.")
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "RAILWAY_TOKEN_EXPIRADO",
                "The Railway token has expired. Replace it to continue.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "RAILWAY_TOKEN_INVALIDO",
                "The supplied token is invalid or has been revoked.",
            ),
            StatusCode::FORBIDDEN => Self::new(
                "RAILWAY_SEM_PERMISSAO",
                "The token does not have permission to access this Railway resource.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            status if status.is_server_error() => {
                Self::new("RAILWAY_INDISPONIVEL", "Railway is currently unavailable.")
            }
            _ => Self::new(
                "RAILWAY_ERRO_DESCONHECIDO",
                "Unable to complete the Railway operation.",
            ),
        }
    }

    pub fn graphql() -> Self {
        Self::new(
            "RAILWAY_GRAPHQL",
            "Railway rejected the GraphQL query. Please try again later.",
        )
    }

    pub fn project_not_found() -> Self {
        Self::new(
            "RAILWAY_PROJETO_NAO_ENCONTRADO",
            "The requested Railway project was not found.",
        )
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "RAILWAY_RATE_LIMIT".to_owned(),
            message: "The Railway rate limit has been reached.".to_owned(),
            reset_at: reset_at(headers),
            rate_limit: header_number(headers, "x-ratelimit-limit"),
            rate_limit_remaining: header_number(headers, "x-ratelimit-remaining"),
        }
    }
}

fn header_number(headers: &HeaderMap, name: &str) -> Option<u64> {
    headers.get(name)?.to_str().ok()?.parse().ok()
}

fn reset_at(headers: &HeaderMap) -> Option<String> {
    if let Some(value) = headers
        .get("x-ratelimit-reset")
        .and_then(|value| value.to_str().ok())
    {
        if let Ok(timestamp) = value.parse::<i64>() {
            if let Some(date) = DateTime::<Utc>::from_timestamp(timestamp, 0) {
                return Some(date.to_rfc3339());
            }
        }
        if DateTime::parse_from_rfc3339(value).is_ok() {
            return Some(value.to_owned());
        }
    }

    let seconds = headers
        .get("retry-after")?
        .to_str()
        .ok()?
        .parse::<i64>()
        .ok()?;
    Utc::now()
        .checked_add_signed(Duration::seconds(seconds))
        .map(|date| date.to_rfc3339())
}
