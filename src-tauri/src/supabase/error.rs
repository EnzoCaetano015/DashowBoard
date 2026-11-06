use chrono::{Duration, Utc};
use reqwest::header::HeaderMap;
use reqwest::StatusCode;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, thiserror::Error)]
#[serde(rename_all = "camelCase")]
#[error("{message}")]
pub struct SupabaseError {
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

impl SupabaseError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_owned(),
            message: message.to_owned(),
            reset_at: None,
        }
    }

    pub fn keyring(_error: keyring::Error) -> Self {
        Self::new(
            "SUPABASE_COFRE_INDISPONIVEL",
            "Unable to access the system credential vault.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new("SUPABASE_TIMEOUT", "Supabase took too long to respond.");
        }
        if error.is_connect() {
            return Self::new(
                "SUPABASE_SEM_CONEXAO",
                "Unable to connect to Supabase. Check your internet connection.",
            );
        }
        Self::new(
            "SUPABASE_INDISPONIVEL",
            "Supabase is currently unavailable.",
        )
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "SUPABASE_TOKEN_EXPIRADO",
                "The Supabase token has expired. Replace it to continue.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "SUPABASE_TOKEN_INVALIDO",
                "The supplied token is invalid or has been revoked.",
            ),
            StatusCode::FORBIDDEN => Self::new(
                "SUPABASE_SEM_PERMISSAO",
                "The token does not have permission to access this Supabase resource.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            status if status.is_server_error() => Self::new(
                "SUPABASE_INDISPONIVEL",
                "Supabase is currently unavailable.",
            ),
            _ => Self::new(
                "SUPABASE_ERRO_DESCONHECIDO",
                "Unable to complete the Supabase operation.",
            ),
        }
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "SUPABASE_RATE_LIMIT".to_owned(),
            message: "The Supabase rate limit has been reached.".to_owned(),
            reset_at: reset_at(headers),
        }
    }
}

fn reset_at(headers: &HeaderMap) -> Option<String> {
    let seconds = headers
        .get("x-ratelimit-reset")?
        .to_str()
        .ok()?
        .parse::<i64>()
        .ok()?;
    Utc::now()
        .checked_add_signed(Duration::seconds(seconds))
        .map(|date| date.to_rfc3339())
}
