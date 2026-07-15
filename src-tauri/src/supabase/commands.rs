use chrono::Utc;
use tauri::State;
use zeroize::Zeroize;

use crate::supabase::client::SupabaseClient;
use crate::supabase::error::SupabaseError;
use crate::supabase::models::{
    ApiOrganization, ApiProfile, ApiProject, GetSupabaseProjectsResponse,
    SaveSupabaseConnectionRequest, SupabaseConnection, SupabaseDatabase,
    SupabaseOrganizationFailure, SupabaseProject,
};
use crate::supabase::storage;

#[tauri::command]
pub async fn salvar_conexao_supabase(
    client: State<'_, SupabaseClient>,
    mut request: SaveSupabaseConnectionRequest,
) -> Result<SupabaseConnection, SupabaseError> {
    if request.token.trim().is_empty() {
        return Err(SupabaseError::new(
            "SUPABASE_TOKEN_INVALIDO",
            "Informe o Personal Access Token do Supabase.",
        ));
    }
    let result = save_connection(&client, request.token.trim()).await;
    request.token.zeroize();
    result
}

async fn save_connection(
    client: &SupabaseClient,
    token: &str,
) -> Result<SupabaseConnection, SupabaseError> {
    let (profile, organizations, projects) = synchronize(client, token).await?;
    let connection = build_connection(&profile, organizations.len(), &projects);
    storage::replace(token, &connection)?;
    Ok(connection)
}

#[tauri::command]
pub fn obter_conexao_supabase() -> Result<Option<SupabaseConnection>, SupabaseError> {
    storage::load_connection()
}

#[tauri::command]
pub async fn testar_conexao_supabase(
    client: State<'_, SupabaseClient>,
) -> Result<SupabaseConnection, SupabaseError> {
    let mut connection = storage::load_connection()?.ok_or_else(|| {
        SupabaseError::new(
            "SUPABASE_SEM_CONEXAO",
            "Nenhuma conexão Supabase está configurada.",
        )
    })?;
    refresh_connection(&client, &mut connection).await;
    storage::save_connection(&connection)?;
    Ok(connection)
}

#[tauri::command]
pub fn remover_conexao_supabase() -> Result<(), SupabaseError> {
    storage::delete_connection()
}

#[tauri::command]
pub async fn obter_projetos_supabase(
    client: State<'_, SupabaseClient>,
) -> Result<GetSupabaseProjectsResponse, SupabaseError> {
    let mut token = storage::get_token()?;
    let result = synchronize(&client, &token).await;
    token.zeroize();

    let (profile, organizations, projects) = result?;
    let connection = build_connection(&profile, organizations.len(), &projects);
    storage::save_connection(&connection)?;
    Ok(projects)
}

async fn refresh_connection(client: &SupabaseClient, connection: &mut SupabaseConnection) {
    let result = match storage::get_token() {
        Ok(mut token) => {
            let result = synchronize(client, &token).await;
            token.zeroize();
            result
        }
        Err(error) => Err(error),
    };
    match result {
        Ok((profile, organizations, projects)) => {
            *connection = build_connection(&profile, organizations.len(), &projects)
        }
        Err(error) => {
            connection.status = "error".to_owned();
            connection.erro = Some(error.message);
            connection.erro_codigo = Some(error.code);
            connection.ultima_sincronizacao = Utc::now().to_rfc3339();
        }
    }
}

async fn synchronize(
    client: &SupabaseClient,
    token: &str,
) -> Result<
    (
        ApiProfile,
        Vec<ApiOrganization>,
        GetSupabaseProjectsResponse,
    ),
    SupabaseError,
> {
    let profile = client.get_profile(token).await?;
    let organizations = client.get_organizations(token).await?;
    let projects = get_projects(client, token, &organizations).await;
    Ok((profile, organizations, projects))
}

async fn get_projects(
    client: &SupabaseClient,
    token: &str,
    organizations: &[ApiOrganization],
) -> GetSupabaseProjectsResponse {
    let mut projects = Vec::new();
    let mut failures = Vec::new();

    for organization in organizations {
        match client.get_projects(token, &organization.slug).await {
            Ok(items) => projects.extend(
                items
                    .into_iter()
                    .map(|project| map_project(project, organization)),
            ),
            Err(error) => failures.push(map_failure(organization, error)),
        }
    }

    projects.sort_by(|left, right| {
        left.organizacao_nome
            .to_lowercase()
            .cmp(&right.organizacao_nome.to_lowercase())
            .then_with(|| left.nome.to_lowercase().cmp(&right.nome.to_lowercase()))
    });
    GetSupabaseProjectsResponse { projects, failures }
}

fn build_connection(
    profile: &ApiProfile,
    organization_count: usize,
    projects: &GetSupabaseProjectsResponse,
) -> SupabaseConnection {
    let failure = projects.failures.first();
    SupabaseConnection {
        user_id: profile.gotrue_id.clone(),
        username: profile.username.clone(),
        email: profile.primary_email.clone(),
        quantidade_organizacoes: organization_count,
        quantidade_projetos: projects.projects.len(),
        ultima_sincronizacao: Utc::now().to_rfc3339(),
        status: if failure.is_some() {
            "error".to_owned()
        } else {
            "connected".to_owned()
        },
        erro: failure.map(|item| item.message.clone()),
        erro_codigo: failure.map(|item| item.code.clone()),
    }
}

fn map_project(project: ApiProject, organization: &ApiOrganization) -> SupabaseProject {
    let database = project
        .databases
        .iter()
        .find(|database| database.tipo.eq_ignore_ascii_case("PRIMARY"))
        .or_else(|| project.databases.first())
        .map(map_database);
    let status = normalize_status(&project.status).to_owned();
    let project_ref = project.r#ref;

    SupabaseProject {
        dashboard_url: format!("https://supabase.com/dashboard/project/{project_ref}"),
        r#ref: project_ref,
        nome: project.name,
        organizacao_id: organization.id.clone(),
        organizacao_slug: organization.slug.clone(),
        organizacao_nome: organization.name.clone(),
        cloud_provider: project.cloud_provider,
        regiao: project.region,
        branch: project.is_branch,
        status_original: project.status,
        status,
        criado_em: project.inserted_at,
        banco: database,
    }
}

fn map_database(database: &crate::supabase::models::ApiDatabase) -> SupabaseDatabase {
    SupabaseDatabase {
        identifier: database.identifier.clone(),
        tipo: database.tipo.clone(),
        status_original: database.status.clone(),
        status: normalize_status(&database.status).to_owned(),
        compute_size: database.infra_compute_size.clone(),
        regiao: database.region.clone(),
        cloud_provider: database.cloud_provider.clone(),
    }
}

fn map_failure(
    organization: &ApiOrganization,
    error: SupabaseError,
) -> SupabaseOrganizationFailure {
    SupabaseOrganizationFailure {
        organizacao_id: organization.id.clone(),
        organizacao_slug: organization.slug.clone(),
        organizacao_nome: organization.name.clone(),
        code: "SUPABASE_ORGANIZACAO_INDISPONIVEL".to_owned(),
        message: format!(
            "Não foi possível listar os projetos desta organização. {}",
            error.message
        ),
        reset_at: error.reset_at,
    }
}

fn normalize_status(status: &str) -> &'static str {
    match status {
        "ACTIVE_HEALTHY" => "healthy",
        "INACTIVE" => "offline",
        "COMING_UP" | "RESTORING" => "updating",
        _ => "unknown",
    }
}
