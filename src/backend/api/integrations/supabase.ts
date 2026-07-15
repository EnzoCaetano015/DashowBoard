import { invoke } from "@tauri-apps/api/core"

import type {
    ObterConexaoSupabase,
    ObterProjetosSupabase,
    RemoverConexaoSupabase,
    SalvarConexaoSupabase,
    TestarConexaoSupabase,
} from "@/backend/api/models/supabase.types"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export const salvarConexaoSupabase = (request: SalvarConexaoSupabase.Request) => {
    exigirRuntimeTauri("Supabase")
    return invoke<SalvarConexaoSupabase.Response>("salvar_conexao_supabase", { request })
}

export const obterConexaoSupabase = () => {
    exigirRuntimeTauri("Supabase")
    return invoke<ObterConexaoSupabase.Response>("obter_conexao_supabase")
}

export const testarConexaoSupabase = () => {
    exigirRuntimeTauri("Supabase")
    return invoke<TestarConexaoSupabase.Response>("testar_conexao_supabase")
}

export const removerConexaoSupabase = () => {
    exigirRuntimeTauri("Supabase")
    return invoke<RemoverConexaoSupabase.Response>("remover_conexao_supabase")
}

export const obterProjetosSupabase = () => {
    exigirRuntimeTauri("Supabase")
    return invoke<ObterProjetosSupabase.Response>("obter_projetos_supabase")
}
