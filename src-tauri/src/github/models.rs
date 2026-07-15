use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionType {
    Personal,
    Organization,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubConnection {
    pub id: String,
    pub nome: String,
    pub resource_owner: String,
    pub tipo: ConnectionType,
    pub login: String,
    pub avatar_url: String,
    pub status: String,
    pub quantidade_repositorios: usize,
    pub ultima_sincronizacao: String,
    pub erro: Option<String>,
    pub erro_codigo: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveGitHubConnectionRequest {
    pub connection_id: Option<String>,
    pub nome: String,
    pub resource_owner: String,
    pub tipo: ConnectionType,
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubConnectionIdRequest {
    pub connection_id: String,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetGitHubRepositoriesRequest {
    pub connection_ids: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubRepository {
    pub id: u64,
    pub node_id: String,
    pub nome: String,
    pub full_name: String,
    pub owner_login: String,
    pub owner_avatar_url: String,
    pub description: Option<String>,
    pub private: bool,
    pub fork: bool,
    pub archived: bool,
    pub html_url: String,
    pub default_branch: String,
    pub language: Option<String>,
    pub topics: Vec<String>,
    pub updated_at: String,
    pub pushed_at: Option<String>,
    pub connection_id: String,
    pub connection_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubConnectionFailure {
    pub connection_id: String,
    pub connection_name: String,
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetGitHubRepositoriesResponse {
    pub repositories: Vec<GitHubRepository>,
    pub failures: Vec<GitHubConnectionFailure>,
}

#[derive(Debug, Deserialize)]
pub struct ApiGitHubUser {
    pub login: String,
    pub avatar_url: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiGitHubOwner {
    pub login: String,
    pub avatar_url: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiGitHubRepository {
    pub id: u64,
    pub node_id: String,
    pub name: String,
    pub full_name: String,
    pub owner: ApiGitHubOwner,
    pub description: Option<String>,
    pub private: bool,
    pub fork: bool,
    pub archived: bool,
    pub html_url: String,
    pub default_branch: String,
    pub language: Option<String>,
    #[serde(default)]
    pub topics: Vec<String>,
    pub updated_at: String,
    pub pushed_at: Option<String>,
}
