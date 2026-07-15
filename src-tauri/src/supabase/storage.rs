use keyring::{Entry, Error as KeyringError};

use crate::supabase::error::SupabaseError;
use crate::supabase::models::SupabaseConnection;

const SERVICE: &str = "com.caeta.dashowboard";
const CONNECTION_ACCOUNT: &str = "supabase-connection";
const TOKEN_ACCOUNT: &str = "supabase-token";

fn entry(account: &str) -> Result<Entry, SupabaseError> {
    Entry::new(SERVICE, account).map_err(SupabaseError::keyring)
}

pub fn load_connection() -> Result<Option<SupabaseConnection>, SupabaseError> {
    match entry(CONNECTION_ACCOUNT)?.get_password() {
        Ok(serialized) => serde_json::from_str(&serialized).map(Some).map_err(|_| {
            SupabaseError::new(
                "SUPABASE_COFRE_INDISPONIVEL",
                "Os dados seguros da conexão Supabase estão corrompidos.",
            )
        }),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(SupabaseError::keyring(error)),
    }
}

pub fn save_connection(connection: &SupabaseConnection) -> Result<(), SupabaseError> {
    let serialized = serde_json::to_string(connection).map_err(|_| {
        SupabaseError::new(
            "SUPABASE_COFRE_INDISPONIVEL",
            "Não foi possível preparar os dados seguros da conexão Supabase.",
        )
    })?;
    entry(CONNECTION_ACCOUNT)?
        .set_password(&serialized)
        .map_err(SupabaseError::keyring)
}

pub fn get_token() -> Result<String, SupabaseError> {
    match entry(TOKEN_ACCOUNT)?.get_password() {
        Ok(token) => Ok(token),
        Err(KeyringError::NoEntry) => Err(SupabaseError::new(
            "SUPABASE_SEM_CONEXAO",
            "Nenhuma conexão Supabase está configurada.",
        )),
        Err(error) => Err(SupabaseError::keyring(error)),
    }
}

pub fn replace(token: &str, connection: &SupabaseConnection) -> Result<(), SupabaseError> {
    let previous_token = entry(TOKEN_ACCOUNT)?.get_password().ok();
    entry(TOKEN_ACCOUNT)?
        .set_password(token)
        .map_err(SupabaseError::keyring)?;
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

pub fn delete_connection() -> Result<(), SupabaseError> {
    for account in [TOKEN_ACCOUNT, CONNECTION_ACCOUNT] {
        match entry(account)?.delete_credential() {
            Ok(()) | Err(KeyringError::NoEntry) => {}
            Err(error) => return Err(SupabaseError::keyring(error)),
        }
    }
    Ok(())
}
