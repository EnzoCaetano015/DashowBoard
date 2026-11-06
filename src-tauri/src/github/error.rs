use chrono::{DateTime, Utc};
use reqwest::header::HeaderMap;
use reqwest::StatusCode;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
#[error("{message}")]
pub struct GitHubError {
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

impl GitHubError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_owned(),
            message: message.to_owned(),
            reset_at: None,
        }
    }

    pub fn connection_not_found() -> Self {
        Self::new(
            "GITHUB_CONEXAO_NAO_ENCONTRADA",
            "The requested GitHub connection was not found.",
        )
    }

    pub fn keyring(_error: keyring::Error) -> Self {
        Self::new(
            "GITHUB_COFRE_INDISPONIVEL",
            "Unable to access the system credential vault.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new("GITHUB_TIMEOUT", "GitHub took too long to respond.");
        }
        if error.is_connect() {
            return Self::new(
                "GITHUB_SEM_CONEXAO",
                "Unable to connect to GitHub. Check your internet connection.",
            );
        }
        Self::new("GITHUB_INDISPONIVEL", "GitHub is currently unavailable.")
    }

    pub fn status(status: StatusCode, headers: &HeaderMap) -> Self {
        match status {
            StatusCode::UNAUTHORIZED if token_expired(headers) => Self::new(
                "GITHUB_TOKEN_EXPIRADO",
                "This connection's token has expired. Replace it to continue.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "GITHUB_TOKEN_INVALIDO",
                "The supplied token is invalid or has been revoked.",
            ),
            StatusCode::FORBIDDEN if header_u32(headers, "x-ratelimit-remaining") == Some(0) => {
                Self {
                    code: "GITHUB_RATE_LIMIT".to_owned(),
                    message: "The GitHub rate limit has been reached.".to_owned(),
                    reset_at: header_reset(headers),
                }
            }
            StatusCode::FORBIDDEN => Self::new(
                "GITHUB_SEM_PERMISSAO",
                "The token does not have permission to access these repositories.",
            ),
            status if status.is_server_error() => {
                Self::new("GITHUB_INDISPONIVEL", "GitHub is currently unavailable.")
            }
            _ => Self::new(
                "GITHUB_ERRO_DESCONHECIDO",
                "Unable to complete the GitHub operation.",
            ),
        }
    }
}

fn token_expired(headers: &HeaderMap) -> bool {
    headers
        .get("github-authentication-token-expiration")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| DateTime::parse_from_rfc3339(value).ok())
        .is_some_and(|expires_at| expires_at.with_timezone(&Utc) <= Utc::now())
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
