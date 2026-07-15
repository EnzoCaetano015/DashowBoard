use keyring::{Entry, Error as KeyringError};

use crate::vercel::error::VercelError;
use crate::vercel::models::VercelConnection;

const SERVICE: &str = "com.caeta.dashowboard";
const CONNECTION_ACCOUNT: &str = "vercel-connection";
const TOKEN_ACCOUNT: &str = "vercel-token";

fn entry(account: &str) -> Result<Entry, VercelError> {
    Entry::new(SERVICE, account).map_err(VercelError::keyring)
}

pub fn load_connection() -> Result<Option<VercelConnection>, VercelError> {
    match entry(CONNECTION_ACCOUNT)?.get_password() {
        Ok(serialized) => serde_json::from_str(&serialized).map(Some).map_err(|_| {
            VercelError::new(
                "VERCEL_COFRE_INDISPONIVEL",
                "Os dados seguros da conexão Vercel estão corrompidos.",
            )
        }),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(VercelError::keyring(error)),
    }
}

pub fn save_connection(connection: &VercelConnection) -> Result<(), VercelError> {
    let serialized = serde_json::to_string(connection).map_err(|_| {
        VercelError::new(
            "VERCEL_COFRE_INDISPONIVEL",
            "Não foi possível preparar os dados seguros da conexão Vercel.",
        )
    })?;
    entry(CONNECTION_ACCOUNT)?
        .set_password(&serialized)
        .map_err(VercelError::keyring)
}

pub fn get_token() -> Result<String, VercelError> {
    match entry(TOKEN_ACCOUNT)?.get_password() {
        Ok(token) => Ok(token),
        Err(KeyringError::NoEntry) => Err(VercelError::new(
            "VERCEL_SEM_CONEXAO",
            "Nenhuma conexão Vercel está configurada.",
        )),
        Err(error) => Err(VercelError::keyring(error)),
    }
}

pub fn replace(token: &str, connection: &VercelConnection) -> Result<(), VercelError> {
    let previous_token = entry(TOKEN_ACCOUNT)?.get_password().ok();
    entry(TOKEN_ACCOUNT)?
        .set_password(token)
        .map_err(VercelError::keyring)?;
    if let Err(error) = save_connection(connection) {
        if let Some(previous_token) = previous_token {
            let _ = entry(TOKEN_ACCOUNT)?.set_password(&previous_token);
        } else {
            let _ = entry(TOKEN_ACCOUNT)?.delete_credential();
        }
        return Err(error);
    }
    Ok(())
}

pub fn delete_connection() -> Result<(), VercelError> {
    for account in [TOKEN_ACCOUNT, CONNECTION_ACCOUNT] {
        match entry(account)?.delete_credential() {
            Ok(()) | Err(KeyringError::NoEntry) => {}
            Err(error) => return Err(VercelError::keyring(error)),
        }
    }
    Ok(())
}
