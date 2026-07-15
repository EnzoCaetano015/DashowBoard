use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelConnection {
    pub user_id: String,
    pub username: String,
    pub nome: Option<String>,
    pub avatar_url: Option<String>,
    pub quantidade_times: usize,
    pub quantidade_projetos: usize,
    pub ultima_sincronizacao: String,
    pub status: String,
    pub erro: Option<String>,
    pub erro_codigo: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SaveVercelConnectionRequest {
    pub token: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelScope {
    pub id: Option<String>,
    pub nome: String,
    pub slug: Option<String>,
    pub tipo: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelGitRepository {
    pub tipo: String,
    pub repositorio: String,
    pub organizacao: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelDeployment {
    pub id: String,
    pub nome: String,
    pub url: Option<String>,
    pub estado: Option<String>,
    pub estado_original: String,
    pub target: Option<String>,
    pub created_at: String,
    pub ready_at: Option<String>,
    pub branch: Option<String>,
    pub commit_sha: Option<String>,
    pub commit_message: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelProject {
    pub id: String,
    pub nome: String,
    pub account_id: String,
    pub escopo: VercelScope,
    pub framework: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub production_url: Option<String>,
    pub git_repository: Option<VercelGitRepository>,
    pub ultimo_deployment: Option<VercelDeployment>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VercelScopeFailure {
    pub scope_id: Option<String>,
    pub scope_name: String,
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GetVercelProjectsResponse {
    pub projects: Vec<VercelProject>,
    pub failures: Vec<VercelScopeFailure>,
}

#[derive(Debug, Deserialize)]
pub struct ApiUserResponse {
    pub user: ApiUser,
}

#[derive(Debug, Deserialize)]
pub struct ApiUser {
    pub id: String,
    pub username: String,
    pub name: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ApiTeamsResponse {
    pub teams: Vec<ApiTeam>,
    pub pagination: ApiPagination,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ApiTeam {
    pub id: String,
    pub name: String,
    pub slug: String,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum ApiProjectsResponse {
    List(Vec<ApiProject>),
    Paginated {
        projects: Vec<ApiProject>,
        pagination: ApiPagination,
    },
}

impl ApiProjectsResponse {
    pub fn into_parts(self) -> (Vec<ApiProject>, Option<String>) {
        match self {
            Self::List(projects) => (projects, None),
            Self::Paginated {
                projects,
                pagination,
            } => (projects, pagination.next_string()),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiProject {
    pub id: String,
    pub name: String,
    pub account_id: String,
    pub framework: Option<String>,
    pub created_at: ApiTimestamp,
    pub updated_at: ApiTimestamp,
    pub link: Option<ApiProjectLink>,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectLink {
    #[serde(rename = "type")]
    pub provider: String,
    pub repo: String,
    pub org: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ApiDeploymentsResponse {
    pub deployments: Vec<ApiDeployment>,
    pub pagination: ApiPagination,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiDeployment {
    pub uid: String,
    pub name: String,
    pub project_id: String,
    pub url: Option<String>,
    pub state: Option<String>,
    pub ready_state: Option<String>,
    pub target: Option<String>,
    pub created: Option<ApiTimestamp>,
    pub created_at: Option<ApiTimestamp>,
    pub ready: Option<ApiTimestamp>,
    pub ready_at: Option<ApiTimestamp>,
    #[serde(default)]
    pub meta: HashMap<String, Value>,
}

impl ApiDeployment {
    pub fn state(&self) -> &str {
        self.state
            .as_deref()
            .or(self.ready_state.as_deref())
            .unwrap_or("UNKNOWN")
    }

    pub fn created_at(&self) -> Option<&ApiTimestamp> {
        self.created_at.as_ref().or(self.created.as_ref())
    }

    pub fn ready_at(&self) -> Option<&ApiTimestamp> {
        self.ready_at.as_ref().or(self.ready.as_ref())
    }
}

#[derive(Debug, Deserialize)]
pub struct ApiPagination {
    pub next: Option<Value>,
}

impl ApiPagination {
    pub fn next_string(&self) -> Option<String> {
        match self.next.as_ref()? {
            Value::String(value) => Some(value.clone()),
            Value::Number(value) => Some(value.to_string()),
            _ => None,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum ApiTimestamp {
    Integer(i64),
    Float(f64),
    String(String),
}

impl ApiTimestamp {
    pub fn milliseconds(&self) -> Option<i64> {
        match self {
            Self::Integer(value) => Some(*value),
            Self::Float(value) => Some(*value as i64),
            Self::String(value) => value.parse().ok(),
        }
    }
}
