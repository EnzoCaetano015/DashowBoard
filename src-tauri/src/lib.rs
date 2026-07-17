mod github;
mod railway;
mod supabase;
mod vercel;

use github::client::GitHubClient;
use github::commands::{
    obter_conexoes_github, obter_repositorios_github, remover_conexao_github,
    salvar_conexao_github, testar_conexao_github,
};
use railway::client::RailwayClient;
use railway::commands::{
    obter_conexao_railway, obter_projetos_railway, remover_conexao_railway, salvar_conexao_railway,
    testar_conexao_railway,
};
use supabase::client::SupabaseClient;
use supabase::commands::{
    obter_conexao_supabase, obter_projetos_supabase, remover_conexao_supabase,
    salvar_conexao_supabase, testar_conexao_supabase,
};
use tauri::Manager;
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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            std::fs::create_dir_all(app.path().app_config_dir()?)?;
            Ok(())
        })
        .manage(GitHubClient::new())
        .manage(RailwayClient::new())
        .manage(SupabaseClient::new())
        .manage(VercelClient::new())
        .invoke_handler(tauri::generate_handler![
            salvar_conexao_github,
            obter_conexoes_github,
            testar_conexao_github,
            remover_conexao_github,
            obter_repositorios_github,
            salvar_conexao_railway,
            obter_conexao_railway,
            testar_conexao_railway,
            remover_conexao_railway,
            obter_projetos_railway,
            salvar_conexao_vercel,
            obter_conexao_vercel,
            testar_conexao_vercel,
            remover_conexao_vercel,
            obter_projetos_vercel,
            salvar_conexao_supabase,
            obter_conexao_supabase,
            testar_conexao_supabase,
            remover_conexao_supabase,
            obter_projetos_supabase,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
