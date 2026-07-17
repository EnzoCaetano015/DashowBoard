use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RailwayConnection {
    pub user_id: String,
    pub nome: String,
    pub email: String,
    pub avatar_url: Option<String>,
    pub quantidade_workspaces: usize,
    pub quantidade_projetos: usize,
    pub ultima_sincronizacao: String,
    pub status: String,
    pub erro: Option<String>,
    pub erro_codigo: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SaveRailwayConnectionRequest {
    pub token: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RailwayUsage {
    pub valor_atual: Option<f64>,
    pub unidade: Option<String>,
    pub saldo_creditos: Option<f64>,
    pub saldo_disponivel_na_api: bool,
    pub atualizado_em: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RailwayService {
    pub id: String,
    pub nome: String,
    pub environment_id: String,
    pub environment_name: String,
    pub regiao: Option<String>,
    pub replicas: Option<i64>,
    pub healthcheck_path: Option<String>,
    pub deployment_id: Option<String>,
    pub deployment_status_original: Option<String>,
    pub status: String,
    pub deployment_criado_em: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RailwayEnvironment {
    pub id: String,
    pub nome: String,
    pub servicos: Vec<RailwayService>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RailwayProject {
    pub id: String,
    pub nome: String,
    pub descricao: Option<String>,
    pub workspace_id: Option<String>,
    pub workspace_nome: String,
    pub criado_em: String,
    pub atualizado_em: String,
    pub status: String,
    pub ambientes: Vec<RailwayEnvironment>,
    pub uso: Option<RailwayUsage>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RailwayFailure {
    pub workspace_id: Option<String>,
    pub workspace_name: String,
    pub project_id: Option<String>,
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
    pub rate_limit: Option<u64>,
    pub rate_limit_remaining: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct GetRailwayProjectsResponse {
    pub projects: Vec<RailwayProject>,
    pub failures: Vec<RailwayFailure>,
}

#[derive(Debug, Deserialize)]
pub struct ApiAccountData {
    pub me: ApiRailwayUser,
}

#[derive(Debug, Deserialize)]
pub struct ApiRailwayUser {
    pub id: String,
    pub name: String,
    pub email: String,
    pub avatar: Option<String>,
    #[serde(default)]
    pub workspaces: Vec<ApiWorkspace>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ApiWorkspace {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectsData {
    pub projects: ApiProjectsConnection,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiProjectsConnection {
    pub edges: Vec<ApiProjectEdge>,
    pub page_info: ApiPageInfo,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectEdge {
    pub node: ApiProjectSummary,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiProjectSummary {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiPageInfo {
    pub has_next_page: bool,
    pub end_cursor: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectData {
    pub project: Option<ApiProjectIdentity>,
    pub environments: ApiEnvironmentConnection,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectIdentity {
    #[serde(rename = "id")]
    pub _id: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiEnvironmentConnection {
    pub edges: Vec<ApiEnvironmentEdge>,
}

#[derive(Debug, Deserialize)]
pub struct ApiEnvironmentEdge {
    pub node: ApiEnvironmentSummary,
}

#[derive(Debug, Deserialize)]
pub struct ApiEnvironmentSummary {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiEnvironmentData {
    pub environment: Option<ApiEnvironmentDetails>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiEnvironmentDetails {
    pub id: String,
    pub name: String,
    pub service_instances: ApiServiceInstanceConnection,
}

#[derive(Debug, Deserialize)]
pub struct ApiServiceInstanceConnection {
    pub edges: Vec<ApiServiceInstanceEdge>,
}

#[derive(Debug, Deserialize)]
pub struct ApiServiceInstanceEdge {
    pub node: ApiServiceInstance,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiServiceInstance {
    pub id: String,
    pub service_name: String,
    pub healthcheck_path: Option<String>,
    pub region: Option<String>,
    pub num_replicas: Option<i64>,
    pub latest_deployment: Option<ApiDeployment>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiDeployment {
    pub id: String,
    pub status: String,
    pub created_at: String,
}
