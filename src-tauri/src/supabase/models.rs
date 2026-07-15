use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupabaseConnection {
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub quantidade_organizacoes: usize,
    pub quantidade_projetos: usize,
    pub ultima_sincronizacao: String,
    pub status: String,
    pub erro: Option<String>,
    pub erro_codigo: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SaveSupabaseConnectionRequest {
    pub token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupabaseDatabase {
    pub identifier: String,
    pub tipo: String,
    pub status_original: String,
    pub status: String,
    pub compute_size: Option<String>,
    pub regiao: Option<String>,
    pub cloud_provider: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupabaseProject {
    pub r#ref: String,
    pub nome: String,
    pub organizacao_id: String,
    pub organizacao_slug: String,
    pub organizacao_nome: String,
    pub cloud_provider: Option<String>,
    pub regiao: Option<String>,
    pub branch: bool,
    pub status_original: String,
    pub status: String,
    pub criado_em: String,
    pub banco: Option<SupabaseDatabase>,
    pub dashboard_url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SupabaseOrganizationFailure {
    pub organizacao_id: String,
    pub organizacao_slug: String,
    pub organizacao_nome: String,
    pub code: String,
    pub message: String,
    pub reset_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GetSupabaseProjectsResponse {
    pub projects: Vec<SupabaseProject>,
    pub failures: Vec<SupabaseOrganizationFailure>,
}

#[derive(Debug, Deserialize)]
pub struct ApiProfile {
    pub gotrue_id: String,
    pub primary_email: String,
    pub username: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiOrganization {
    pub id: String,
    pub slug: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct ApiProjectsResponse {
    pub projects: Vec<ApiProject>,
    pub pagination: ApiPagination,
}

#[derive(Debug, Deserialize)]
pub struct ApiProject {
    pub r#ref: String,
    pub name: String,
    pub cloud_provider: Option<String>,
    pub region: Option<String>,
    #[serde(default)]
    pub is_branch: bool,
    pub status: String,
    #[serde(default)]
    pub inserted_at: String,
    #[serde(default)]
    pub databases: Vec<ApiDatabase>,
}

#[derive(Debug, Deserialize)]
pub struct ApiDatabase {
    pub identifier: String,
    #[serde(rename = "type")]
    pub tipo: String,
    pub status: String,
    pub infra_compute_size: Option<String>,
    pub region: Option<String>,
    pub cloud_provider: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ApiPagination {
    pub count: usize,
    pub offset: usize,
}
