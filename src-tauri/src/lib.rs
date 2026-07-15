mod github;
mod vercel;

use github::client::GitHubClient;
use github::commands::{
    obter_conexoes_github, obter_repositorios_github, remover_conexao_github,
    salvar_conexao_github, testar_conexao_github,
};
use vercel::client::VercelClient;
use vercel::commands::{
    obter_conexao_vercel, obter_projetos_vercel, remover_conexao_vercel, salvar_conexao_vercel,
    testar_conexao_vercel,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .manage(GitHubClient::new())
        .manage(VercelClient::new())
        .invoke_handler(tauri::generate_handler![
            salvar_conexao_github,
            obter_conexoes_github,
            testar_conexao_github,
            remover_conexao_github,
            obter_repositorios_github,
            salvar_conexao_vercel,
            obter_conexao_vercel,
            testar_conexao_vercel,
            remover_conexao_vercel,
            obter_projetos_vercel,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
