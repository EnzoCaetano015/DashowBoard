use keyring::{Entry, Error as KeyringError};

use crate::github::error::GitHubError;
use crate::github::models::GitHubConnection;

const SERVICE: &str = "com.caeta.dashowboard";
const INDEX_ACCOUNT: &str = "github-connections-index";

fn entry(account: &str) -> Result<Entry, GitHubError> {
    Entry::new(SERVICE, account).map_err(GitHubError::keyring)
}

fn token_account(connection_id: &str) -> String {
    format!("github-token:{connection_id}")
}

pub fn load_connections() -> Result<Vec<GitHubConnection>, GitHubError> {
    match entry(INDEX_ACCOUNT)?.get_password() {
        Ok(serialized) => serde_json::from_str(&serialized).map_err(|_| {
            GitHubError::new(
                "GITHUB_COFRE_INDISPONIVEL",
                "O índice seguro de conexões GitHub está corrompido.",
            )
        }),
        Err(KeyringError::NoEntry) => Ok(Vec::new()),
        Err(error) => Err(GitHubError::keyring(error)),
    }
}

pub fn save_connections(connections: &[GitHubConnection]) -> Result<(), GitHubError> {
    let serialized = serde_json::to_string(connections).map_err(|_| {
        GitHubError::new(
            "GITHUB_COFRE_INDISPONIVEL",
            "Não foi possível preparar o índice seguro de conexões.",
        )
    })?;
    entry(INDEX_ACCOUNT)?
        .set_password(&serialized)
        .map_err(GitHubError::keyring)
}

pub fn get_token(connection_id: &str) -> Result<String, GitHubError> {
    match entry(&token_account(connection_id))?.get_password() {
        Ok(token) => Ok(token),
        Err(KeyringError::NoEntry) => Err(GitHubError::connection_not_found()),
        Err(error) => Err(GitHubError::keyring(error)),
    }
}

pub fn save_token(connection_id: &str, token: &str) -> Result<(), GitHubError> {
    entry(&token_account(connection_id))?
        .set_password(token)
        .map_err(GitHubError::keyring)
}

pub fn delete_token(connection_id: &str) -> Result<(), GitHubError> {
    match entry(&token_account(connection_id))?.delete_credential() {
        Ok(()) | Err(KeyringError::NoEntry) => Ok(()),
        Err(error) => Err(GitHubError::keyring(error)),
    }
}
