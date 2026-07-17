use keyring::{Entry, Error as KeyringError};

use crate::railway::error::RailwayError;
use crate::railway::models::RailwayConnection;

const SERVICE: &str = "com.caeta.dashowboard";
const CONNECTION_ACCOUNT: &str = "railway-connection";
const TOKEN_ACCOUNT: &str = "railway-token";

fn entry(account: &str) -> Result<Entry, RailwayError> {
    Entry::new(SERVICE, account).map_err(RailwayError::keyring)
}

pub fn load_connection() -> Result<Option<RailwayConnection>, RailwayError> {
    match entry(CONNECTION_ACCOUNT)?.get_password() {
        Ok(serialized) => serde_json::from_str(&serialized).map(Some).map_err(|_| {
            RailwayError::new(
                "RAILWAY_COFRE_INDISPONIVEL",
                "Os dados seguros da conexão Railway estão corrompidos.",
            )
        }),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(RailwayError::keyring(error)),
    }
}

pub fn save_connection(connection: &RailwayConnection) -> Result<(), RailwayError> {
    let serialized = serde_json::to_string(connection).map_err(|_| {
        RailwayError::new(
            "RAILWAY_COFRE_INDISPONIVEL",
            "Não foi possível preparar os dados seguros da conexão Railway.",
        )
    })?;
    entry(CONNECTION_ACCOUNT)?
        .set_password(&serialized)
        .map_err(RailwayError::keyring)
}

pub fn get_token() -> Result<String, RailwayError> {
    match entry(TOKEN_ACCOUNT)?.get_password() {
        Ok(token) => Ok(token),
        Err(KeyringError::NoEntry) => Err(RailwayError::new(
            "RAILWAY_SEM_CONEXAO",
            "Nenhuma conexão Railway está configurada.",
        )),
        Err(error) => Err(RailwayError::keyring(error)),
    }
}

pub fn replace(token: &str, connection: &RailwayConnection) -> Result<(), RailwayError> {
    let previous_token = entry(TOKEN_ACCOUNT)?.get_password().ok();
    entry(TOKEN_ACCOUNT)?
        .set_password(token)
        .map_err(RailwayError::keyring)?;
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

pub fn delete_connection() -> Result<(), RailwayError> {
    for account in [TOKEN_ACCOUNT, CONNECTION_ACCOUNT] {
        match entry(account)?.delete_credential() {
            Ok(()) | Err(KeyringError::NoEntry) => {}
            Err(error) => return Err(RailwayError::keyring(error)),
        }
    }
    Ok(())
}
