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
            "Não foi possível acessar o cofre de credenciais do sistema.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new(
                "SUPABASE_TIMEOUT",
                "O Supabase demorou demais para responder.",
            );
        }
        if error.is_connect() {
            return Self::new(
                "SUPABASE_SEM_CONEXAO",
                "Não foi possível conectar ao Supabase. Verifique sua internet.",
            );
        }
        Self::new(
            "SUPABASE_INDISPONIVEL",
            "O Supabase está indisponível no momento.",
        )
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "SUPABASE_TOKEN_EXPIRADO",
                "O token do Supabase expirou. Substitua-o para continuar.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "SUPABASE_TOKEN_INVALIDO",
                "O token informado é inválido ou foi revogado.",
            ),
            StatusCode::FORBIDDEN => Self::new(
                "SUPABASE_SEM_PERMISSAO",
                "O token não possui permissão para consultar este recurso do Supabase.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            status if status.is_server_error() => Self::new(
                "SUPABASE_INDISPONIVEL",
                "O Supabase está indisponível no momento.",
            ),
            _ => Self::new(
                "SUPABASE_ERRO_DESCONHECIDO",
                "Não foi possível concluir a operação no Supabase.",
            ),
        }
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "SUPABASE_RATE_LIMIT".to_owned(),
            message: "O limite de requisições do Supabase foi atingido.".to_owned(),
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
