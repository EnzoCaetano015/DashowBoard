use std::time::Duration;

use reqwest::header::{HeaderMap, ACCEPT, USER_AGENT};
use reqwest::Client;
use serde::de::DeserializeOwned;

use crate::github::error::GitHubError;
use crate::github::models::{ApiGitHubRepository, ApiGitHubUser};

const API_URL: &str = "https://api.github.com";
const API_VERSION: &str = "2022-11-28";
const PAGE_SIZE: usize = 100;
const MAX_PAGES: usize = 1_000;

pub struct GitHubClient {
    http: Result<Client, String>,
}

impl GitHubClient {
    pub fn new() -> Self {
        Self {
            http: Client::builder()
                .timeout(Duration::from_secs(20))
                .user_agent("DashowBoard/0.1")
                .build()
                .map_err(|error| error.to_string()),
        }
    }

    fn http(&self) -> Result<&Client, GitHubError> {
        self.http.as_ref().map_err(|_| {
            GitHubError::new(
                "GITHUB_ERRO_DESCONHECIDO",
                "Não foi possível inicializar o cliente do GitHub.",
            )
        })
    }

    pub async fn get_user(&self, token: &str) -> Result<ApiGitHubUser, GitHubError> {
        let (user, _) = self.get_json(token, "/user").await?;
        Ok(user)
    }

    pub async fn get_repositories(
        &self,
        token: &str,
    ) -> Result<Vec<ApiGitHubRepository>, GitHubError> {
        let mut repositories = Vec::new();
        for page in 1..=MAX_PAGES {
            let path = format!(
                "/user/repos?per_page={PAGE_SIZE}&page={page}&sort=updated&direction=desc&affiliation=owner,collaborator,organization_member"
            );
            let (items, _) = self
                .get_json::<Vec<ApiGitHubRepository>>(token, &path)
                .await?;
            let count = items.len();
            repositories.extend(items);
            if count < PAGE_SIZE {
                break;
            }
        }
        Ok(repositories)
    }

    async fn get_json<T: DeserializeOwned>(
        &self,
        token: &str,
        path: &str,
    ) -> Result<(T, HeaderMap), GitHubError> {
        let response = self
            .http()?
            .get(format!("{API_URL}{path}"))
            .header(USER_AGENT, "DashowBoard/0.1")
            .header(ACCEPT, "application/vnd.github+json")
            .header("X-GitHub-Api-Version", API_VERSION)
            .bearer_auth(token)
            .send()
            .await
            .map_err(GitHubError::network)?;
        let status = response.status();
        let headers = response.headers().clone();
        if !status.is_success() {
            return Err(GitHubError::status(status, &headers));
        }
        let value = response.json::<T>().await.map_err(|_| {
            GitHubError::new(
                "GITHUB_ERRO_DESCONHECIDO",
                "O GitHub retornou dados em um formato inesperado.",
            )
        })?;
        Ok((value, headers))
    }
}
