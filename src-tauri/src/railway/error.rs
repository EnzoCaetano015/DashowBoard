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
            "Não foi possível acessar o cofre de credenciais do sistema.",
        )
    }

    pub fn network(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            return Self::new(
                "RAILWAY_TIMEOUT",
                "A Railway demorou demais para responder.",
            );
        }
        if error.is_connect() {
            return Self::new(
                "RAILWAY_SEM_CONEXAO",
                "Não foi possível conectar à Railway. Verifique sua internet.",
            );
        }
        Self::new(
            "RAILWAY_INDISPONIVEL",
            "A Railway está indisponível no momento.",
        )
    }

    pub fn status(status: StatusCode, headers: &HeaderMap, body: &str) -> Self {
        let body = body.to_lowercase();
        match status {
            StatusCode::UNAUTHORIZED if body.contains("expired") => Self::new(
                "RAILWAY_TOKEN_EXPIRADO",
                "O token da Railway expirou. Substitua-o para continuar.",
            ),
            StatusCode::UNAUTHORIZED => Self::new(
                "RAILWAY_TOKEN_INVALIDO",
                "O token informado é inválido ou foi revogado.",
            ),
            StatusCode::FORBIDDEN => Self::new(
                "RAILWAY_SEM_PERMISSAO",
                "O token não possui permissão para consultar este recurso da Railway.",
            ),
            StatusCode::TOO_MANY_REQUESTS => Self::rate_limit(headers),
            status if status.is_server_error() => Self::new(
                "RAILWAY_INDISPONIVEL",
                "A Railway está indisponível no momento.",
            ),
            _ => Self::new(
                "RAILWAY_ERRO_DESCONHECIDO",
                "Não foi possível concluir a operação na Railway.",
            ),
        }
    }

    pub fn graphql() -> Self {
        Self::new(
            "RAILWAY_GRAPHQL",
            "A Railway rejeitou a consulta GraphQL. Tente novamente mais tarde.",
        )
    }

    pub fn project_not_found() -> Self {
        Self::new(
            "RAILWAY_PROJETO_NAO_ENCONTRADO",
            "O projeto Railway informado não foi encontrado.",
        )
    }

    fn rate_limit(headers: &HeaderMap) -> Self {
        Self {
            code: "RAILWAY_RATE_LIMIT".to_owned(),
            message: "O limite de requisições da Railway foi atingido.".to_owned(),
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
