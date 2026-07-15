use std::collections::HashSet;
use std::time::Duration;

use reqwest::header::{HeaderMap, ACCEPT, CONTENT_TYPE, USER_AGENT};
use reqwest::Client;
use serde::de::DeserializeOwned;

use crate::vercel::error::VercelError;
use crate::vercel::models::{
    ApiDeployment, ApiDeploymentsResponse, ApiProject, ApiProjectsResponse, ApiTeam,
    ApiTeamsResponse, ApiUser, ApiUserResponse,
};

const API_URL: &str = "https://api.vercel.com";
const PAGE_SIZE: &str = "100";
const MAX_PAGES: usize = 1_000;

pub struct VercelClient {
    http: Result<Client, String>,
}

impl VercelClient {
    pub fn new() -> Self {
        Self {
            http: Client::builder()
                .timeout(Duration::from_secs(20))
                .user_agent("DashwoBoard/0.1")
                .build()
                .map_err(|error| error.to_string()),
        }
    }

    fn http(&self) -> Result<&Client, VercelError> {
        self.http.as_ref().map_err(|_| {
            VercelError::new(
                "VERCEL_ERRO_DESCONHECIDO",
                "Não foi possível inicializar o cliente da Vercel.",
            )
        })
    }

    pub async fn get_user(&self, token: &str) -> Result<ApiUser, VercelError> {
        let response: ApiUserResponse = self.get_json(token, "/v2/user", &[]).await?;
        Ok(response.user)
    }

    pub async fn get_teams(&self, token: &str) -> Result<Vec<ApiTeam>, VercelError> {
        let mut teams = Vec::new();
        let mut cursor: Option<String> = None;
        let mut seen = HashSet::new();
        for _ in 0..MAX_PAGES {
            let mut query = vec![("limit", PAGE_SIZE.to_owned())];
            if let Some(value) = cursor.as_ref() {
                query.push(("until", value.clone()));
            }
            let response: ApiTeamsResponse = self.get_json(token, "/v2/teams", &query).await?;
            let next = response.pagination.next_string();
            teams.extend(response.teams);
            if !advance_cursor(&mut cursor, &mut seen, next) {
                break;
            }
        }
        Ok(teams)
    }

    pub async fn get_projects(
        &self,
        token: &str,
        team_id: Option<&str>,
    ) -> Result<Vec<ApiProject>, VercelError> {
        let mut projects = Vec::new();
        let mut cursor: Option<String> = None;
        let mut seen = HashSet::new();
        for _ in 0..MAX_PAGES {
            let mut query = vec![("limit", PAGE_SIZE.to_owned())];
            if let Some(team_id) = team_id {
                query.push(("teamId", team_id.to_owned()));
            }
            if let Some(value) = cursor.as_ref() {
                query.push(("from", value.clone()));
            }
            let response: ApiProjectsResponse =
                self.get_json(token, "/v10/projects", &query).await?;
            let (items, next) = response.into_parts();
            projects.extend(items);
            if !advance_cursor(&mut cursor, &mut seen, next) {
                break;
            }
        }
        Ok(projects)
    }

    pub async fn get_production_deployments(
        &self,
        token: &str,
        team_id: Option<&str>,
    ) -> Result<Vec<ApiDeployment>, VercelError> {
        let mut deployments = Vec::new();
        let mut cursor: Option<String> = None;
        let mut seen = HashSet::new();
        for _ in 0..MAX_PAGES {
            let mut query = vec![
                ("limit", PAGE_SIZE.to_owned()),
                ("target", "production".to_owned()),
            ];
            if let Some(team_id) = team_id {
                query.push(("teamId", team_id.to_owned()));
            }
            if let Some(value) = cursor.as_ref() {
                query.push(("until", value.clone()));
            }
            let response: ApiDeploymentsResponse =
                self.get_json(token, "/v7/deployments", &query).await?;
            let next = response.pagination.next_string();
            deployments.extend(response.deployments);
            if !advance_cursor(&mut cursor, &mut seen, next) {
                break;
            }
        }
        Ok(deployments)
    }

    async fn get_json<T: DeserializeOwned>(
        &self,
        token: &str,
        path: &str,
        query: &[(&str, String)],
    ) -> Result<T, VercelError> {
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
            .map_err(VercelError::network)?;
        let status = response.status();
        let headers: HeaderMap = response.headers().clone();
        let body = response.text().await.map_err(VercelError::network)?;
        if !status.is_success() {
            return Err(VercelError::status(status, &headers, &body));
        }
        serde_json::from_str(&body).map_err(|_| {
            VercelError::new(
                "VERCEL_ERRO_DESCONHECIDO",
                "A Vercel retornou dados em um formato inesperado.",
            )
        })
    }
}

fn advance_cursor(
    cursor: &mut Option<String>,
    seen: &mut HashSet<String>,
    next: Option<String>,
) -> bool {
    let Some(next) = next.filter(|value| !value.is_empty()) else {
        return false;
    };
    if !seen.insert(next.clone()) {
        return false;
    }
    *cursor = Some(next);
    true
}
