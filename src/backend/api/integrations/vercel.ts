import { invoke } from "@tauri-apps/api/core"

import type {
    ObterConexaoVercel,
    ObterProjetosVercel,
    RemoverConexaoVercel,
    SalvarConexaoVercel,
    TestarConexaoVercel,
} from "@/backend/api/models/vercel.types"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export const salvarConexaoVercel = async (
    request: SalvarConexaoVercel.Request
): Promise<SalvarConexaoVercel.Response> => {
    exigirRuntimeTauri("Vercel")
    return invoke("salvar_conexao_vercel", { request })
}

export const obterConexaoVercel = async (): Promise<ObterConexaoVercel.Response> => {
    exigirRuntimeTauri("Vercel")
    return invoke("obter_conexao_vercel")
}

export const testarConexaoVercel = async (): Promise<TestarConexaoVercel.Response> => {
    exigirRuntimeTauri("Vercel")
    return invoke("testar_conexao_vercel")
}

export const removerConexaoVercel = async (): Promise<RemoverConexaoVercel.Response> => {
    exigirRuntimeTauri("Vercel")
    return invoke("remover_conexao_vercel")
}

export const obterProjetosVercel = async (): Promise<ObterProjetosVercel.Response> => {
    exigirRuntimeTauri("Vercel")
    return invoke("obter_projetos_vercel")
}
