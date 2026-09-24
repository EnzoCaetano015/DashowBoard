use std::time::{Duration, Instant};

use chrono::{SecondsFormat, Utc};
use reqwest::{Client, StatusCode, Url};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificarHealthCheckRequest {
    pub url: String,
    pub timeout_segundos: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerificarHealthCheckResponse {
    pub status: &'static str,
    pub status_http: Option<u16>,
    pub tempo_resposta_ms: Option<u64>,
    pub mensagem: Option<String>,
    pub verificado_em: String,
}

fn classificar_status(status: StatusCode) -> &'static str {
    if status.is_success() || status.is_redirection() {
        "healthy"
    } else if status.is_client_error() {
        "degraded"
    } else if status.is_server_error() {
        "offline"
    } else {
        "unknown"
    }
}

async fn executar_health_check(
    request: VerificarHealthCheckRequest,
) -> Result<VerificarHealthCheckResponse, String> {
    let url = Url::parse(request.url.trim()).map_err(|_| {
        "Informe uma URL válida para executar o monitoramento do projeto.".to_owned()
    })?;
    if !matches!(url.scheme(), "http" | "https") {
        return Err("O monitoramento aceita somente URLs HTTP ou HTTPS.".to_owned());
    }

    let timeout_segundos = request.timeout_segundos.clamp(1, 60);
    let inicio = Instant::now();
    let client = Client::builder()
        .timeout(Duration::from_secs(timeout_segundos))
        .build()
        .map_err(|_| "Não foi possível preparar o health check do projeto.".to_owned())?;
    let resultado = client.get(url).send().await;
    let tempo_resposta_ms = inicio.elapsed().as_millis().try_into().unwrap_or(u64::MAX);
    let verificado_em = Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true);

    match resultado {
        Ok(response) => {
            let status_http = response.status();
            let status = classificar_status(status_http);
            let mensagem = if status == "healthy" {
                None
            } else {
                Some(format!(
                    "A URL respondeu com status HTTP {}.",
                    status_http.as_u16()
                ))
            };
            Ok(VerificarHealthCheckResponse {
                status,
                status_http: Some(status_http.as_u16()),
                tempo_resposta_ms: Some(tempo_resposta_ms),
                mensagem,
                verificado_em,
            })
        }
        Err(error) => {
            let (status, mensagem) = if error.is_timeout() {
                (
                    "offline",
                    format!(
                        "A URL excedeu o timeout de {} segundo(s).",
                        timeout_segundos
                    ),
                )
            } else if error.is_connect() {
                (
                    "offline",
                    "Não foi possível conectar à URL da aplicação.".to_owned(),
                )
            } else {
                (
                    "unknown",
                    "Não foi possível concluir o health check da aplicação.".to_owned(),
                )
            };
            Ok(VerificarHealthCheckResponse {
                status,
                status_http: None,
                tempo_resposta_ms: Some(tempo_resposta_ms),
                mensagem: Some(mensagem),
                verificado_em,
            })
        }
    }
}

#[tauri::command]
pub async fn verificar_health_check_projeto(
    request: VerificarHealthCheckRequest,
) -> Result<VerificarHealthCheckResponse, String> {
    executar_health_check(request).await
}

#[cfg(test)]
mod tests {
    use std::{
        io::{Read, Write},
        net::TcpListener,
        thread,
        time::Duration,
    };

    use super::{classificar_status, executar_health_check, VerificarHealthCheckRequest};
    use reqwest::StatusCode;

    fn iniciar_servidor(status: u16, atraso: Duration) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").expect("porta local disponível");
        let endereco = listener.local_addr().expect("endereço local");
        thread::spawn(move || {
            let (mut stream, _) = listener.accept().expect("conexão do health check");
            let mut request = [0_u8; 1_024];
            let _ = stream.read(&mut request);
            thread::sleep(atraso);
            let resposta = format!(
                "HTTP/1.1 {status} Teste\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
            );
            let _ = stream.write_all(resposta.as_bytes());
        });
        format!("http://{endereco}")
    }

    fn executar(url: String, timeout_segundos: u64) -> super::VerificarHealthCheckResponse {
        tauri::async_runtime::block_on(executar_health_check(VerificarHealthCheckRequest {
            url,
            timeout_segundos,
        }))
        .expect("health check normalizado")
    }

    #[test]
    fn classifica_respostas_http() {
        assert_eq!(classificar_status(StatusCode::OK), "healthy");
        assert_eq!(
            classificar_status(StatusCode::TEMPORARY_REDIRECT),
            "healthy"
        );
        assert_eq!(classificar_status(StatusCode::NOT_FOUND), "degraded");
        assert_eq!(classificar_status(StatusCode::BAD_GATEWAY), "offline");
    }

    #[test]
    fn executa_respostas_http_reais() {
        for (codigo, esperado) in [
            (200, "healthy"),
            (302, "healthy"),
            (404, "degraded"),
            (503, "offline"),
        ] {
            let resposta = executar(iniciar_servidor(codigo, Duration::ZERO), 2);
            assert_eq!(resposta.status, esperado);
            assert_eq!(resposta.status_http, Some(codigo));
            assert!(resposta.tempo_resposta_ms.is_some());
        }
    }

    #[test]
    fn normaliza_timeout_como_offline() {
        let resposta = executar(iniciar_servidor(200, Duration::from_millis(1_200)), 1);
        assert_eq!(resposta.status, "offline");
        assert!(resposta
            .mensagem
            .as_deref()
            .unwrap_or_default()
            .contains("timeout"));
    }

    #[test]
    fn normaliza_conexao_recusada_como_offline() {
        let listener = TcpListener::bind("127.0.0.1:0").expect("porta local disponível");
        let endereco = listener.local_addr().expect("endereço local");
        drop(listener);

        let resposta = executar(format!("http://{endereco}"), 1);
        assert_eq!(resposta.status, "offline");
        assert_eq!(resposta.status_http, None);
    }
}
