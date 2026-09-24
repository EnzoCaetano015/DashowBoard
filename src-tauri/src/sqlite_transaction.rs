use serde::Deserialize;
use serde_json::Value;
use sqlx::SqlitePool;
use tauri::State;
use tauri_plugin_sql::{DbInstances, DbPool};

const DATABASE_URL: &str = "sqlite:data.sqlite";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperacaoSqlite {
    query: String,
    #[serde(default)]
    values: Vec<Value>,
}

async fn executar_operacoes(
    pool: &SqlitePool,
    operacoes: Vec<OperacaoSqlite>,
) -> Result<(), String> {
    let mut connection = pool
        .acquire()
        .await
        .map_err(|_| "Não foi possível obter a conexão SQLite.".to_owned())?;
    sqlx::query("BEGIN IMMEDIATE")
        .execute(&mut *connection)
        .await
        .map_err(|_| "Não foi possível iniciar a transação SQLite.".to_owned())?;

    for (indice, operacao) in operacoes.into_iter().enumerate() {
        let mut query = sqlx::query(&operacao.query);
        for value in operacao.values {
            query = match value {
                Value::Null => query.bind(None::<String>),
                Value::Bool(value) => query.bind(value),
                Value::Number(value) => {
                    if let Some(value) = value.as_i64() {
                        query.bind(value)
                    } else if let Some(value) = value.as_u64() {
                        query.bind(i64::try_from(value).unwrap_or(i64::MAX))
                    } else {
                        query.bind(value.as_f64().unwrap_or_default())
                    }
                }
                Value::String(value) => query.bind(value),
                value => query.bind(value.to_string()),
            };
        }
        if query.execute(&mut *connection).await.is_err() {
            let mensagem = format!(
                "Não foi possível executar a operação {} da transação SQLite.",
                indice + 1
            );
            let _ = sqlx::query("ROLLBACK").execute(&mut *connection).await;
            return Err(mensagem);
        }
    }

    sqlx::query("COMMIT")
        .execute(&mut *connection)
        .await
        .map(|_| ())
        .map_err(|_| "Não foi possível concluir a transação SQLite.".to_owned())
}

#[tauri::command]
pub async fn executar_transacao_sqlite(
    operacoes: Vec<OperacaoSqlite>,
    instances: State<'_, DbInstances>,
) -> Result<(), String> {
    let instances = instances.0.read().await;
    let database = instances
        .get(DATABASE_URL)
        .ok_or_else(|| "O banco SQLite ainda não foi carregado.".to_owned())?;
    let DbPool::Sqlite(pool) = database;
    executar_operacoes(pool, operacoes).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::Row;

    async fn criar_banco() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query("CREATE TABLE itens (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE)")
            .execute(&pool)
            .await
            .unwrap();
        pool
    }

    #[test]
    fn confirma_todas_as_operacoes_do_lote() {
        tauri::async_runtime::block_on(async {
            let pool = criar_banco().await;

            executar_operacoes(
                &pool,
                vec![
                    OperacaoSqlite {
                        query: "INSERT INTO itens (id, nome) VALUES ($1, $2)".to_owned(),
                        values: vec![Value::from(1), Value::from("primeiro")],
                    },
                    OperacaoSqlite {
                        query: "INSERT INTO itens (id, nome) VALUES ($1, $2)".to_owned(),
                        values: vec![Value::from(2), Value::from("segundo")],
                    },
                ],
            )
            .await
            .unwrap();

            let quantidade = sqlx::query("SELECT COUNT(*) AS quantidade FROM itens")
                .fetch_one(&pool)
                .await
                .unwrap()
                .get::<i64, _>("quantidade");
            assert_eq!(quantidade, 2);
        });
    }

    #[test]
    fn desfaz_todo_o_lote_quando_uma_operacao_falha() {
        tauri::async_runtime::block_on(async {
            let pool = criar_banco().await;
            let resultado = executar_operacoes(
                &pool,
                vec![
                    OperacaoSqlite {
                        query: "INSERT INTO itens (id, nome) VALUES ($1, $2)".to_owned(),
                        values: vec![Value::from(1), Value::from("repetido")],
                    },
                    OperacaoSqlite {
                        query: "INSERT INTO itens (id, nome) VALUES ($1, $2)".to_owned(),
                        values: vec![Value::from(2), Value::from("repetido")],
                    },
                ],
            )
            .await;

            assert!(resultado.is_err());
            let quantidade = sqlx::query("SELECT COUNT(*) AS quantidade FROM itens")
                .fetch_one(&pool)
                .await
                .unwrap()
                .get::<i64, _>("quantidade");
            assert_eq!(quantidade, 0);
        });
    }
}
