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
            "Não foi possível acessar o cofre de credenciais do sistema.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new("VERCEL_TIMEOUT", "A Vercel demorou demais para responder.");
        }
        if error.is_connect() {
            return Self::new(
                "VERCEL_SEM_CONEXAO",
                "Não foi possível conectar à Vercel. Verifique sua internet.",
            );
        }
        Self::new(
            "VERCEL_INDISPONIVEL",
            "A Vercel está indisponível no momento.",
        )
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "VERCEL_TOKEN_EXPIRADO",
                "O token da Vercel expirou. Substitua-o para continuar.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "VERCEL_TOKEN_INVALIDO",
                "O token informado é inválido ou foi revogado.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            StatusCode::FORBIDDEN if header_u32(headers, "x-ratelimit-remaining") == Some(0) => {
                Self::rate_limit(headers)
            }
            StatusCode::FORBIDDEN => Self::new(
                "VERCEL_SEM_PERMISSAO",
                "O token não possui permissão para consultar este recurso da Vercel.",
            ),
            status if status.is_server_error() => Self::new(
                "VERCEL_INDISPONIVEL",
                "A Vercel está indisponível no momento.",
            ),
            _ => Self::new(
                "VERCEL_ERRO_DESCONHECIDO",
                "Não foi possível concluir a operação na Vercel.",
            ),
        }
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "VERCEL_RATE_LIMIT".to_owned(),
            message: "O limite de requisições da Vercel foi atingido.".to_owned(),
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
