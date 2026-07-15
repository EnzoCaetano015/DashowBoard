use std::time::Duration;

use reqwest::header::{HeaderMap, ACCEPT, CONTENT_TYPE, USER_AGENT};
use reqwest::Client;
use serde::de::DeserializeOwned;

use crate::supabase::error::SupabaseError;
use crate::supabase::models::{ApiOrganization, ApiProfile, ApiProject, ApiProjectsResponse};

const API_URL: &str = "https://api.supabase.com";
const PAGE_SIZE: usize = 100;
const MAX_PAGES: usize = 1_000;

pub struct SupabaseClient {
    http: Result<Client, String>,
}

impl SupabaseClient {
    pub fn new() -> Self {
        Self {
            http: Client::builder()
                .timeout(Duration::from_secs(20))
                .user_agent("DashwoBoard/0.1")
                .build()
                .map_err(|error| error.to_string()),
        }
    }

    fn http(&self) -> Result<&Client, SupabaseError> {
        self.http.as_ref().map_err(|_| {
            SupabaseError::new(
                "SUPABASE_ERRO_DESCONHECIDO",
                "Não foi possível inicializar o cliente do Supabase.",
            )
        })
    }

    pub async fn get_profile(&self, token: &str) -> Result<ApiProfile, SupabaseError> {
        self.get_json(token, "/v1/profile", &[]).await
    }

    pub async fn get_organizations(
        &self,
        token: &str,
    ) -> Result<Vec<ApiOrganization>, SupabaseError> {
        self.get_json(token, "/v1/organizations", &[]).await
    }

    pub async fn get_projects(
        &self,
        token: &str,
        organization_slug: &str,
    ) -> Result<Vec<ApiProject>, SupabaseError> {
        let path = format!("/v1/organizations/{organization_slug}/projects");
        let mut projects = Vec::new();
        let mut offset = 0usize;

        for _ in 0..MAX_PAGES {
            let response: ApiProjectsResponse = self
                .get_json(
                    token,
                    &path,
                    &[
                        ("offset", offset.to_string()),
                        ("limit", PAGE_SIZE.to_string()),
                    ],
                )
                .await?;
            let page_size = response.projects.len();
            let next_offset = response.pagination.offset.saturating_add(page_size);
            let total = response.pagination.count;
            projects.extend(response.projects);

            if page_size == 0 || next_offset >= total || next_offset <= offset {
                break;
            }
            offset = next_offset;
        }
        Ok(projects)
    }

    async fn get_json<T: DeserializeOwned>(
        &self,
        token: &str,
        path: &str,
        query: &[(&str, String)],
    ) -> Result<T, SupabaseError> {
        let response = self
            .http()?
            .get(format!("{API_URL}{path}"))
            .header(USER_AGENT, "DashwoBoard/0.1")
            .header(ACCEPT, "application/json")
            .header(CONTENT_TYPE, "application/json")
            .bearer_auth(token)
            .query(query)
            .send()
            .await
            .map_err(SupabaseError::network)?;
        let status = response.status();
        let headers: HeaderMap = response.headers().clone();
        let body = response.text().await.map_err(SupabaseError::network)?;
        if !status.is_success() {
            return Err(SupabaseError::status(status, &headers, &body));
        }
        serde_json::from_str(&body).map_err(|_| {
            SupabaseError::new(
                "SUPABASE_ERRO_DESCONHECIDO",
                "O Supabase retornou dados em um formato inesperado.",
            )
        })
    }
}
