use std::collections::{HashMap, HashSet};

use chrono::{DateTime, Utc};
use serde_json::Value;
use tauri::State;
use zeroize::Zeroize;

use crate::vercel::client::VercelClient;
use crate::vercel::error::VercelError;
use crate::vercel::models::{
    ApiDeployment, ApiProject, ApiTeam, ApiTimestamp, GetVercelProjectsResponse,
    SaveVercelConnectionRequest, VercelConnection, VercelDeployment, VercelGitRepository,
    VercelProject, VercelScope, VercelScopeFailure,
};
use crate::vercel::storage;

#[tauri::command]
pub async fn salvar_conexao_vercel(
    client: State<'_, VercelClient>,
    mut request: SaveVercelConnectionRequest,
) -> Result<VercelConnection, VercelError> {
    if request.token.trim().is_empty() {
        return Err(VercelError::new(
            "VERCEL_TOKEN_INVALIDO",
            "Informe o token da Vercel.",
        ));
    }
    let result = save_connection(&client, request.token.trim()).await;
    request.token.zeroize();
    result
}

async fn save_connection(
    client: &VercelClient,
    token: &str,
) -> Result<VercelConnection, VercelError> {
    let connection = build_connection(client, token).await?;
    storage::replace(token, &connection)?;
    Ok(connection)
}

#[tauri::command]
pub async fn obter_conexao_vercel(
    client: State<'_, VercelClient>,
) -> Result<Option<VercelConnection>, VercelError> {
    let Some(mut connection) = storage::load_connection()? else {
        return Ok(None);
    };
    refresh_connection(&client, &mut connection).await;
    storage::save_connection(&connection)?;
    Ok(Some(connection))
}

#[tauri::command]
pub async fn testar_conexao_vercel(
    client: State<'_, VercelClient>,
) -> Result<VercelConnection, VercelError> {
    let mut connection = storage::load_connection()?.ok_or_else(|| {
        VercelError::new(
            "VERCEL_SEM_CONEXAO",
            "Nenhuma conexão Vercel está configurada.",
        )
    })?;
    refresh_connection(&client, &mut connection).await;
    storage::save_connection(&connection)?;
    Ok(connection)
}

#[tauri::command]
pub fn remover_conexao_vercel() -> Result<(), VercelError> {
    storage::delete_connection()
}

#[tauri::command]
pub async fn obter_projetos_vercel(
    client: State<'_, VercelClient>,
) -> Result<GetVercelProjectsResponse, VercelError> {
    let mut token = storage::get_token()?;
    let result = get_projects(&client, &token).await;
    token.zeroize();
    result
}

async fn build_connection(
    client: &VercelClient,
    token: &str,
) -> Result<VercelConnection, VercelError> {
    let user = client.get_user(token).await?;
    let teams = client.get_teams(token).await?;
    let scopes = build_scopes(&user.username, &teams);
    let mut project_ids = HashSet::new();
    let mut first_error = None;
    for scope in &scopes {
        match client.get_projects(token, scope.id.as_deref()).await {
            Ok(projects) => {
                project_ids.extend(projects.into_iter().map(|project| project.id));
            }
            Err(error) if first_error.is_none() => first_error = Some(error),
            Err(_) => {}
        }
    }
    let avatar_url = user.avatar.as_deref().map(normalize_avatar_url);
    Ok(VercelConnection {
        user_id: user.id,
        username: user.username,
        nome: user.name,
        avatar_url,
        quantidade_times: teams.len(),
        quantidade_projetos: project_ids.len(),
        ultima_sincronizacao: Utc::now().to_rfc3339(),
        status: if first_error.is_some() {
            "error".to_owned()
        } else {
            "connected".to_owned()
        },
        erro: first_error.as_ref().map(|error| error.message.clone()),
        erro_codigo: first_error.map(|error| error.code),
    })
}

async fn refresh_connection(client: &VercelClient, connection: &mut VercelConnection) {
    let result = match storage::get_token() {
        Ok(mut token) => {
            let result = build_connection(client, &token).await;
            token.zeroize();
            result
        }
        Err(error) => Err(error),
    };
    match result {
        Ok(updated) => *connection = updated,
        Err(error) => {
            connection.status = "error".to_owned();
            connection.erro = Some(error.message);
            connection.erro_codigo = Some(error.code);
            connection.ultima_sincronizacao = Utc::now().to_rfc3339();
        }
    }
}

async fn get_projects(
    client: &VercelClient,
    token: &str,
) -> Result<GetVercelProjectsResponse, VercelError> {
    let user = client.get_user(token).await?;
    let teams = client.get_teams(token).await?;
    let scopes = build_scopes(&user.username, &teams);
    let mut project_ids = HashSet::new();
    let mut projects = Vec::new();
    let mut failures = Vec::new();

    for scope in scopes {
        let scope_projects = match client.get_projects(token, scope.id.as_deref()).await {
            Ok(items) => items,
            Err(error) => {
                failures.push(scope_failure(&scope, error));
                continue;
            }
        };
        let deployments = match client
            .get_production_deployments(token, scope.id.as_deref())
            .await
        {
            Ok(items) => items,
            Err(error) => {
                failures.push(scope_failure(&scope, error));
                Vec::new()
            }
        };
        let latest_deployments = latest_deployments_by_project(deployments);
        for project in scope_projects {
            if project_ids.insert(project.id.clone()) {
                let deployment = latest_deployments.get(&project.id);
                projects.push(map_project(project, scope.clone(), deployment));
            }
        }
    }
    projects.sort_by(|left, right| right.updated_at.cmp(&left.updated_at));
    update_connection_after_projects(&user.username, teams.len(), projects.len(), &failures)?;
    Ok(GetVercelProjectsResponse { projects, failures })
}

fn build_scopes(username: &str, teams: &[ApiTeam]) -> Vec<VercelScope> {
    let mut scopes = vec![VercelScope {
        id: None,
        nome: username.to_owned(),
        slug: Some(username.to_owned()),
        tipo: "personal".to_owned(),
    }];
    scopes.extend(teams.iter().map(|team| VercelScope {
        id: Some(team.id.clone()),
        nome: team.name.clone(),
        slug: Some(team.slug.clone()),
        tipo: "team".to_owned(),
    }));
    scopes
}

fn latest_deployments_by_project(
    deployments: Vec<ApiDeployment>,
) -> HashMap<String, ApiDeployment> {
    let mut latest = HashMap::new();
    for deployment in deployments {
        let replace = latest
            .get(&deployment.project_id)
            .and_then(|current: &ApiDeployment| current.created_at())
            .and_then(ApiTimestamp::milliseconds)
            .unwrap_or_default()
            < deployment
                .created_at()
                .and_then(ApiTimestamp::milliseconds)
                .unwrap_or_default();
        if replace || !latest.contains_key(&deployment.project_id) {
            latest.insert(deployment.project_id.clone(), deployment);
        }
    }
    latest
}

fn map_project(
    project: ApiProject,
    scope: VercelScope,
    deployment: Option<&ApiDeployment>,
) -> VercelProject {
    let production_url = deployment
        .and_then(|item| item.url.as_deref())
        .map(normalize_deployment_url);
    VercelProject {
        id: project.id,
        nome: project.name,
        account_id: project.account_id,
        escopo: scope,
        framework: project.framework,
        created_at: format_timestamp(&project.created_at),
        updated_at: format_timestamp(&project.updated_at),
        production_url,
        git_repository: project.link.map(|link| VercelGitRepository {
            tipo: link.provider,
            repositorio: link.repo,
            organizacao: link.org,
        }),
        ultimo_deployment: deployment.map(map_deployment),
    }
}

fn map_deployment(deployment: &ApiDeployment) -> VercelDeployment {
    VercelDeployment {
        id: deployment.uid.clone(),
        nome: deployment.name.clone(),
        url: deployment.url.as_deref().map(normalize_deployment_url),
        estado: normalize_deployment_state(deployment.state()).map(str::to_owned),
        estado_original: deployment.state().to_owned(),
        target: deployment.target.clone(),
        created_at: deployment
            .created_at()
            .map(format_timestamp)
            .unwrap_or_default(),
        ready_at: deployment.ready_at().map(format_timestamp),
        branch: meta_value(
            &deployment.meta,
            &["githubCommitRef", "gitlabCommitRef", "bitbucketCommitRef"],
        ),
        commit_sha: meta_value(
            &deployment.meta,
            &["githubCommitSha", "gitlabCommitSha", "bitbucketCommitSha"],
        ),
        commit_message: meta_value(
            &deployment.meta,
            &[
                "githubCommitMessage",
                "gitlabCommitMessage",
                "bitbucketCommitMessage",
            ],
        ),
    }
}

fn scope_failure(scope: &VercelScope, error: VercelError) -> VercelScopeFailure {
    VercelScopeFailure {
        scope_id: scope.id.clone(),
        scope_name: scope.nome.clone(),
        code: error.code,
        message: error.message,
        reset_at: error.reset_at,
    }
}

fn update_connection_after_projects(
    username: &str,
    team_count: usize,
    project_count: usize,
    failures: &[VercelScopeFailure],
) -> Result<(), VercelError> {
    let Some(mut connection) = storage::load_connection()? else {
        return Ok(());
    };
    connection.username = username.to_owned();
    connection.quantidade_times = team_count;
    connection.quantidade_projetos = project_count;
    connection.ultima_sincronizacao = Utc::now().to_rfc3339();
    connection.status = if failures.is_empty() {
        "connected".to_owned()
    } else {
        "error".to_owned()
    };
    connection.erro = failures.first().map(|failure| failure.message.clone());
    connection.erro_codigo = failures.first().map(|failure| failure.code.clone());
    storage::save_connection(&connection)
}

fn normalize_deployment_state(state: &str) -> Option<&'static str> {
    match state {
        "READY" => Some("success"),
        "ERROR" | "CANCELED" | "BLOCKED" => Some("failed"),
        "QUEUED" | "INITIALIZING" | "BUILDING" => Some("building"),
        _ => None,
    }
}

fn normalize_avatar_url(avatar: &str) -> String {
    if avatar.starts_with("http://") || avatar.starts_with("https://") {
        avatar.to_owned()
    } else {
        format!("https://vercel.com/api/www/avatar/{avatar}?s=96")
    }
}

fn normalize_deployment_url(url: &str) -> String {
    if url.starts_with("http://") || url.starts_with("https://") {
        url.to_owned()
    } else {
        format!("https://{url}")
    }
}

fn format_timestamp(timestamp: &ApiTimestamp) -> String {
    timestamp
        .milliseconds()
        .and_then(DateTime::<Utc>::from_timestamp_millis)
        .map(|date| date.to_rfc3339())
        .unwrap_or_default()
}

fn meta_value(meta: &HashMap<String, Value>, keys: &[&str]) -> Option<String> {
    keys.iter()
        .find_map(|key| meta.get(*key).and_then(Value::as_str).map(str::to_owned))
}
