use std::collections::HashSet;

use chrono::Utc;
use tauri::State;
use zeroize::Zeroize;

use crate::railway::client::RailwayClient;
use crate::railway::error::RailwayError;
use crate::railway::models::{
    ApiProjectSummary, GetRailwayProjectsResponse, RailwayConnection, RailwayEnvironment,
    RailwayFailure, RailwayProject, RailwayService, SaveRailwayConnectionRequest,
};
use crate::railway::storage;

#[tauri::command]
pub async fn salvar_conexao_railway(
    client: State<'_, RailwayClient>,
    mut request: SaveRailwayConnectionRequest,
) -> Result<RailwayConnection, RailwayError> {
    if request.token.trim().is_empty() {
        return Err(RailwayError::new(
            "RAILWAY_TOKEN_INVALIDO",
            "Informe o Account Token da Railway.",
        ));
    }
    let validation = build_connection(&client, request.token.trim()).await;
    let result = match validation {
        Ok(connection) => storage::replace(request.token.trim(), &connection).map(|_| connection),
        Err(error) => Err(error),
    };
    request.token.zeroize();
    result
}

#[tauri::command]
pub fn obter_conexao_railway() -> Result<Option<RailwayConnection>, RailwayError> {
    storage::load_connection()
}

#[tauri::command]
pub async fn testar_conexao_railway(
    client: State<'_, RailwayClient>,
) -> Result<RailwayConnection, RailwayError> {
    let mut connection = storage::load_connection()?.ok_or_else(|| {
        RailwayError::new(
            "RAILWAY_SEM_CONEXAO",
            "Nenhuma conexão Railway está configurada.",
        )
    })?;
    refresh_connection(&client, &mut connection).await;
    storage::save_connection(&connection)?;
    Ok(connection)
}

#[tauri::command]
pub fn remover_conexao_railway() -> Result<(), RailwayError> {
    storage::delete_connection()
}

#[tauri::command]
pub async fn obter_projetos_railway(
    client: State<'_, RailwayClient>,
) -> Result<GetRailwayProjectsResponse, RailwayError> {
    let mut token = storage::get_token()?;
    let result = get_projects(&client, &token).await;
    token.zeroize();
    result
}

async fn build_connection(
    client: &RailwayClient,
    token: &str,
) -> Result<RailwayConnection, RailwayError> {
    let account = client.get_account(token).await?.me;
    let mut project_ids = HashSet::new();
    for project in client.get_projects(token, None).await? {
        project_ids.insert(project.id);
    }
    for workspace in &account.workspaces {
        for project in client.get_projects(token, Some(&workspace.id)).await? {
            project_ids.insert(project.id);
        }
    }

    Ok(RailwayConnection {
        user_id: account.id,
        nome: account.name,
        email: account.email,
        avatar_url: account.avatar,
        quantidade_workspaces: account.workspaces.len(),
        quantidade_projetos: project_ids.len(),
        ultima_sincronizacao: Utc::now().to_rfc3339(),
        status: "connected".to_owned(),
        erro: None,
        erro_codigo: None,
    })
}

async fn refresh_connection(client: &RailwayClient, connection: &mut RailwayConnection) {
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
    client: &RailwayClient,
    token: &str,
) -> Result<GetRailwayProjectsResponse, RailwayError> {
    let account = client.get_account(token).await?.me;
    let mut scopes = vec![(None, "Pessoal".to_owned())];
    scopes.extend(
        account
            .workspaces
            .iter()
            .map(|workspace| (Some(workspace.id.clone()), workspace.name.clone())),
    );
    let mut project_ids = HashSet::new();
    let mut projects = Vec::new();
    let mut failures = Vec::new();

    for (workspace_id, workspace_name) in scopes {
        let summaries = match client.get_projects(token, workspace_id.as_deref()).await {
            Ok(items) => items,
            Err(error) => {
                failures.push(failure(workspace_id.clone(), &workspace_name, None, error));
                continue;
            }
        };
        for summary in summaries {
            if !project_ids.insert(summary.id.clone()) {
                continue;
            }
            match build_project(
                client,
                token,
                summary.clone(),
                workspace_id.clone(),
                &workspace_name,
            )
            .await
            {
                Ok(project) => projects.push(project),
                Err(error) => failures.push(failure(
                    workspace_id.clone(),
                    &workspace_name,
                    Some(summary.id),
                    error,
                )),
            }
        }
    }

    projects.sort_by(|left, right| right.atualizado_em.cmp(&left.atualizado_em));
    update_connection(projects.len(), account.workspaces.len(), &failures)?;
    Ok(GetRailwayProjectsResponse { projects, failures })
}

async fn build_project(
    client: &RailwayClient,
    token: &str,
    summary: ApiProjectSummary,
    workspace_id: Option<String>,
    workspace_name: &str,
) -> Result<RailwayProject, RailwayError> {
    let details = client.get_project(token, &summary.id).await?;
    if details.project.is_none() {
        return Err(RailwayError::project_not_found());
    }
    let mut environments = Vec::new();

    for environment in details.environments.edges {
        let environment_name = environment.node.name;
        let data = client
            .get_environment(token, &environment.node.id)
            .await?
            .environment
            .ok_or_else(RailwayError::project_not_found)?;
        let services = data
            .service_instances
            .edges
            .into_iter()
            .map(|edge| map_service(edge.node, &data.id, &data.name))
            .collect();
        environments.push(RailwayEnvironment {
            id: data.id,
            nome: if data.name.trim().is_empty() {
                environment_name
            } else {
                data.name
            },
            servicos: services,
        });
    }

    let statuses = environments
        .iter()
        .flat_map(|environment| {
            environment
                .servicos
                .iter()
                .map(|service| service.status.as_str())
        })
        .collect::<Vec<_>>();
    Ok(RailwayProject {
        id: summary.id,
        nome: summary.name,
        descricao: summary.description,
        workspace_id,
        workspace_nome: workspace_name.to_owned(),
        criado_em: summary.created_at,
        atualizado_em: summary.updated_at,
        status: aggregate_status(&statuses).to_owned(),
        ambientes: environments,
        uso: None,
    })
}

fn map_service(
    service: crate::railway::models::ApiServiceInstance,
    environment_id: &str,
    environment_name: &str,
) -> RailwayService {
    let original_status = service
        .latest_deployment
        .as_ref()
        .map(|deployment| deployment.status.clone());
    RailwayService {
        id: service.id,
        nome: service.service_name,
        environment_id: environment_id.to_owned(),
        environment_name: environment_name.to_owned(),
        regiao: service.region,
        replicas: service.num_replicas,
        healthcheck_path: service.healthcheck_path,
        deployment_id: service
            .latest_deployment
            .as_ref()
            .map(|deployment| deployment.id.clone()),
        deployment_status_original: original_status.clone(),
        status: normalize_status(original_status.as_deref()).to_owned(),
        deployment_criado_em: service
            .latest_deployment
            .map(|deployment| deployment.created_at),
    }
}

fn normalize_status(status: Option<&str>) -> &'static str {
    match status {
        Some("SUCCESS") => "healthy",
        Some("BUILDING" | "DEPLOYING" | "WAITING" | "QUEUED" | "INITIALIZING") => "updating",
        Some("FAILED" | "CRASHED" | "REMOVED" | "SLEEPING") => "offline",
        _ => "unknown",
    }
}

fn aggregate_status(statuses: &[&str]) -> &'static str {
    if statuses.is_empty() {
        return "unknown";
    }
    let healthy = statuses
        .iter()
        .filter(|status| **status == "healthy")
        .count();
    let offline = statuses
        .iter()
        .filter(|status| **status == "offline")
        .count();
    if offline == statuses.len() {
        return "offline";
    }
    if offline > 0 && healthy > 0 {
        return "degraded";
    }
    if offline > 0 {
        return "degraded";
    }
    if statuses.iter().any(|status| *status == "updating") {
        return "updating";
    }
    if healthy == statuses.len() {
        return "healthy";
    }
    "unknown"
}

fn failure(
    workspace_id: Option<String>,
    workspace_name: &str,
    project_id: Option<String>,
    error: RailwayError,
) -> RailwayFailure {
    RailwayFailure {
        workspace_id,
        workspace_name: workspace_name.to_owned(),
        project_id,
        code: error.code,
        message: error.message,
        reset_at: error.reset_at,
        rate_limit: error.rate_limit,
        rate_limit_remaining: error.rate_limit_remaining,
    }
}

fn update_connection(
    project_count: usize,
    workspace_count: usize,
    failures: &[RailwayFailure],
) -> Result<(), RailwayError> {
    let Some(mut connection) = storage::load_connection()? else {
        return Ok(());
    };
    connection.quantidade_projetos = project_count;
    connection.quantidade_workspaces = workspace_count;
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
