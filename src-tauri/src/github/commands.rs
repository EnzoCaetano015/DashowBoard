use std::collections::HashSet;

use chrono::Utc;
use tauri::State;
use uuid::Uuid;
use zeroize::Zeroize;

use crate::github::client::GitHubClient;
use crate::github::error::GitHubError;
use crate::github::models::{
    ApiGitHubRepository, GetGitHubRepositoriesRequest, GetGitHubRepositoriesResponse,
    GitHubConnection, GitHubConnectionFailure, GitHubConnectionIdRequest, GitHubRepository,
    SaveGitHubConnectionRequest,
};
use crate::github::storage;

#[tauri::command]
pub async fn salvar_conexao_github(
    client: State<'_, GitHubClient>,
    mut request: SaveGitHubConnectionRequest,
) -> Result<GitHubConnection, GitHubError> {
    let result = save_connection(&client, &request).await;
    request.token.zeroize();
    result
}

async fn save_connection(
    client: &GitHubClient,
    request: &SaveGitHubConnectionRequest,
) -> Result<GitHubConnection, GitHubError> {
    validate_field(&request.nome, "Informe um nome para a conexão.")?;
    validate_field(
        &request.resource_owner,
        "Informe o resource owner desta conexão.",
    )?;
    validate_field(&request.token, "Informe o token do GitHub.")?;

    let user = client.get_user(request.token.trim()).await?;
    let repositories = client.get_repositories(request.token.trim()).await?;
    let mut connections = storage::load_connections()?;
    let connection_id = request
        .connection_id
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());
    let existing_index = connections
        .iter()
        .position(|connection| connection.id == connection_id);
    if request.connection_id.is_some() && existing_index.is_none() {
        return Err(GitHubError::connection_not_found());
    }

    let previous_token = match existing_index {
        Some(_) => Some(storage::get_token(&connection_id)?),
        None => None,
    };
    let connection = GitHubConnection {
        id: connection_id.clone(),
        nome: request.nome.trim().to_owned(),
        resource_owner: request.resource_owner.trim().to_owned(),
        tipo: request.tipo,
        login: user.login,
        avatar_url: user.avatar_url,
        status: "connected".to_owned(),
        quantidade_repositorios: repositories.len(),
        ultima_sincronizacao: Utc::now().to_rfc3339(),
        erro: None,
        erro_codigo: None,
    };

    storage::save_token(&connection_id, request.token.trim())?;
    if let Some(index) = existing_index {
        connections[index] = connection.clone();
    } else {
        connections.push(connection.clone());
    }
    if let Err(error) = storage::save_connections(&connections) {
        if let Some(mut token) = previous_token {
            let _ = storage::save_token(&connection_id, &token);
            token.zeroize();
        } else {
            let _ = storage::delete_token(&connection_id);
        }
        return Err(error);
    }
    Ok(connection)
}

#[tauri::command]
pub async fn obter_conexoes_github(
    client: State<'_, GitHubClient>,
) -> Result<Vec<GitHubConnection>, GitHubError> {
    let mut connections = storage::load_connections()?;
    for connection in &mut connections {
        refresh_connection(&client, connection).await;
    }
    storage::save_connections(&connections)?;
    Ok(connections)
}

#[tauri::command]
pub async fn testar_conexao_github(
    client: State<'_, GitHubClient>,
    request: GitHubConnectionIdRequest,
) -> Result<GitHubConnection, GitHubError> {
    let mut connections = storage::load_connections()?;
    let connection = connections
        .iter_mut()
        .find(|connection| connection.id == request.connection_id)
        .ok_or_else(GitHubError::connection_not_found)?;
    refresh_connection(&client, connection).await;
    let updated = connection.clone();
    storage::save_connections(&connections)?;
    Ok(updated)
}

#[tauri::command]
pub fn remover_conexao_github(request: GitHubConnectionIdRequest) -> Result<(), GitHubError> {
    let mut connections = storage::load_connections()?;
    let previous = connections.clone();
    let initial_length = connections.len();
    connections.retain(|connection| connection.id != request.connection_id);
    if connections.len() == initial_length {
        return Err(GitHubError::connection_not_found());
    }

    storage::save_connections(&connections)?;
    if let Err(error) = storage::delete_token(&request.connection_id) {
        let _ = storage::save_connections(&previous);
        return Err(error);
    }
    Ok(())
}

#[tauri::command]
pub async fn obter_repositorios_github(
    client: State<'_, GitHubClient>,
    request: Option<GetGitHubRepositoriesRequest>,
) -> Result<GetGitHubRepositoriesResponse, GitHubError> {
    let mut connections = storage::load_connections()?;
    let requested_ids = request.and_then(|value| value.connection_ids);
    let selected_ids = requested_ids
        .as_ref()
        .map(|ids| ids.iter().collect::<HashSet<_>>());
    let mut repository_ids = HashSet::new();
    let mut repositories = Vec::new();
    let mut failures = Vec::new();

    for connection in &mut connections {
        if selected_ids
            .as_ref()
            .is_some_and(|ids| !ids.contains(&connection.id))
        {
            continue;
        }

        let result = list_connection_repositories(&client, connection).await;
        match result {
            Ok(items) => {
                let repository_count = items.len();
                for item in items {
                    if repository_ids.insert(item.id) {
                        repositories.push(map_repository(item, connection));
                    }
                }
                connection.status = "connected".to_owned();
                connection.quantidade_repositorios = repository_count;
                connection.ultima_sincronizacao = Utc::now().to_rfc3339();
                connection.erro = None;
                connection.erro_codigo = None;
            }
            Err(error) => {
                connection.status = "error".to_owned();
                connection.erro = Some(error.message.clone());
                connection.erro_codigo = Some(error.code.clone());
                failures.push(GitHubConnectionFailure {
                    connection_id: connection.id.clone(),
                    connection_name: connection.nome.clone(),
                    code: error.code,
                    message: error.message,
                    reset_at: error.reset_at,
                });
            }
        }
    }

    storage::save_connections(&connections)?;
    repositories.sort_by(|left, right| right.updated_at.cmp(&left.updated_at));
    Ok(GetGitHubRepositoriesResponse {
        repositories,
        failures,
    })
}

async fn refresh_connection(client: &GitHubClient, connection: &mut GitHubConnection) {
    let result = match storage::get_token(&connection.id) {
        Ok(mut token) => {
            let operation = async {
                let user = client.get_user(&token).await?;
                let repositories = client.get_repositories(&token).await?;
                Ok::<_, GitHubError>((user, repositories))
            }
            .await;
            token.zeroize();
            operation
        }
        Err(error) => Err(error),
    };

    match result {
        Ok((user, repositories)) => {
            connection.login = user.login;
            connection.avatar_url = user.avatar_url;
            connection.status = "connected".to_owned();
            connection.quantidade_repositorios = repositories.len();
            connection.ultima_sincronizacao = Utc::now().to_rfc3339();
            connection.erro = None;
            connection.erro_codigo = None;
        }
        Err(error) => {
            connection.status = "error".to_owned();
            connection.erro = Some(error.message);
            connection.erro_codigo = Some(error.code);
        }
    }
}

async fn list_connection_repositories(
    client: &GitHubClient,
    connection: &GitHubConnection,
) -> Result<Vec<ApiGitHubRepository>, GitHubError> {
    let mut token = storage::get_token(&connection.id)?;
    let result = client.get_repositories(&token).await;
    token.zeroize();
    result
}

fn map_repository(
    repository: ApiGitHubRepository,
    connection: &GitHubConnection,
) -> GitHubRepository {
    GitHubRepository {
        id: repository.id,
        node_id: repository.node_id,
        nome: repository.name,
        full_name: repository.full_name,
        owner_login: repository.owner.login,
        owner_avatar_url: repository.owner.avatar_url,
        description: repository.description,
        private: repository.private,
        fork: repository.fork,
        archived: repository.archived,
        html_url: repository.html_url,
        default_branch: repository.default_branch,
        language: repository.language,
        topics: repository.topics,
        updated_at: repository.updated_at,
        pushed_at: repository.pushed_at,
        connection_id: connection.id.clone(),
        connection_name: connection.nome.clone(),
    }
}

fn validate_field(value: &str, message: &str) -> Result<(), GitHubError> {
    if value.trim().is_empty() {
        return Err(GitHubError::new("GITHUB_ERRO_DESCONHECIDO", message));
    }
    Ok(())
}
