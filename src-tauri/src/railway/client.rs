use std::collections::HashSet;
use std::time::Duration;

use reqwest::header::{HeaderMap, CONTENT_TYPE, USER_AGENT};
use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};

use crate::railway::error::RailwayError;
use crate::railway::models::{
    ApiAccountData, ApiEnvironmentData, ApiProjectData, ApiProjectSummary, ApiProjectsData,
};

const API_URL: &str = "https://backboard.railway.com/graphql/v2";
const PAGE_SIZE: i32 = 50;
const MAX_PAGES: usize = 1_000;

const ACCOUNT_QUERY: &str = r#"
    query RailwayAccount {
        me {
            id
            name
            email
            avatar
            workspaces { id name }
        }
    }
"#;

const PROJECTS_QUERY: &str = r#"
    query RailwayProjects($workspaceId: String, $first: Int!, $after: String) {
        projects(workspaceId: $workspaceId, first: $first, after: $after) {
            edges {
                node { id name description createdAt updatedAt }
            }
            pageInfo { hasNextPage endCursor }
        }
    }
"#;

const PROJECT_QUERY: &str = r#"
    query RailwayProject($id: String!) {
        project(id: $id) { id }
        environments(projectId: $id, isEphemeral: false) {
            edges { node { id name } }
        }
    }
"#;

const ENVIRONMENT_QUERY: &str = r#"
    query RailwayEnvironment($id: String!) {
        environment(id: $id) {
            id
            name
            serviceInstances {
                edges {
                    node {
                        id
                        serviceName
                        healthcheckPath
                        region
                        numReplicas
                        latestDeployment { id status createdAt }
                    }
                }
            }
        }
    }
"#;

pub struct RailwayClient {
    http: Result<Client, String>,
}

impl RailwayClient {
    pub fn new() -> Self {
        Self {
            http: Client::builder()
                .timeout(Duration::from_secs(20))
                .user_agent("DashowBoard/0.1")
                .build()
                .map_err(|error| error.to_string()),
        }
    }

    fn http(&self) -> Result<&Client, RailwayError> {
        self.http.as_ref().map_err(|_| {
            RailwayError::new(
                "RAILWAY_ERRO_DESCONHECIDO",
                "Não foi possível inicializar o cliente da Railway.",
            )
        })
    }

    pub async fn get_account(&self, token: &str) -> Result<ApiAccountData, RailwayError> {
        self.execute(token, ACCOUNT_QUERY, EmptyVariables {}).await
    }

    pub async fn get_projects(
        &self,
        token: &str,
        workspace_id: Option<&str>,
    ) -> Result<Vec<ApiProjectSummary>, RailwayError> {
        let mut projects = Vec::new();
        let mut cursor = None;
        let mut seen = HashSet::new();

        for page in 0..MAX_PAGES {
            let response: ApiProjectsData = self
                .execute(
                    token,
                    PROJECTS_QUERY,
                    ProjectsVariables {
                        workspace_id,
                        first: PAGE_SIZE,
                        after: cursor.as_deref(),
                    },
                )
                .await?;
            projects.extend(response.projects.edges.into_iter().map(|edge| edge.node));
            if !response.projects.page_info.has_next_page {
                return Ok(projects);
            }
            let next = response.projects.page_info.end_cursor.ok_or_else(|| {
                RailwayError::new(
                    "RAILWAY_GRAPHQL",
                    "A Railway informou mais páginas sem fornecer um cursor válido.",
                )
            })?;
            if !seen.insert(next.clone()) {
                return Err(RailwayError::new(
                    "RAILWAY_GRAPHQL",
                    "A Railway repetiu o cursor durante a paginação.",
                ));
            }
            if page + 1 == MAX_PAGES {
                return Err(RailwayError::new(
                    "RAILWAY_GRAPHQL",
                    "A paginação da Railway excedeu o limite seguro da consulta.",
                ));
            }
            cursor = Some(next);
        }
        Err(RailwayError::graphql())
    }

    pub async fn get_project(
        &self,
        token: &str,
        project_id: &str,
    ) -> Result<ApiProjectData, RailwayError> {
        self.execute(token, PROJECT_QUERY, IdVariables { id: project_id })
            .await
    }

    pub async fn get_environment(
        &self,
        token: &str,
        environment_id: &str,
    ) -> Result<ApiEnvironmentData, RailwayError> {
        self.execute(token, ENVIRONMENT_QUERY, IdVariables { id: environment_id })
            .await
    }

    async fn execute<T: DeserializeOwned, V: Serialize>(
        &self,
        token: &str,
        query: &str,
        variables: V,
    ) -> Result<T, RailwayError> {
        let response = self
            .http()?
            .post(API_URL)
            .header(USER_AGENT, "DashowBoard/0.1")
            .header(CONTENT_TYPE, "application/json")
            .bearer_auth(token)
            .json(&GraphQlRequest { query, variables })
            .send()
            .await
            .map_err(RailwayError::network)?;
        let status = response.status();
        let headers: HeaderMap = response.headers().clone();
        let body = response.text().await.map_err(RailwayError::network)?;
        if !status.is_success() {
            return Err(RailwayError::status(status, &headers, &body));
        }

        let response: GraphQlResponse<T> =
            serde_json::from_str(&body).map_err(|_| RailwayError::graphql())?;
        if response.errors.is_some() {
            return Err(RailwayError::graphql());
        }
        response.data.ok_or_else(RailwayError::graphql)
    }
}

#[derive(Serialize)]
struct GraphQlRequest<'a, V> {
    query: &'a str,
    variables: V,
}

#[derive(Deserialize)]
struct GraphQlResponse<T> {
    data: Option<T>,
    errors: Option<Vec<GraphQlError>>,
}

#[derive(Deserialize)]
struct GraphQlError {
    #[serde(rename = "message")]
    _message: String,
}

#[derive(Serialize)]
struct EmptyVariables {}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectsVariables<'a> {
    workspace_id: Option<&'a str>,
    first: i32,
    after: Option<&'a str>,
}

#[derive(Serialize)]
struct IdVariables<'a> {
    id: &'a str,
}
