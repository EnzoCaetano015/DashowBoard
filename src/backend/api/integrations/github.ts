import { invoke } from "@tauri-apps/api/core"

import type {
    ObterConexoesGitHub,
    ObterRepositoriosGitHub,
    RemoverConexaoGitHub,
    SalvarConexaoGitHub,
    TestarConexaoGitHub,
} from "@/backend/api/models/github.types"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export const salvarConexaoGitHub = async (
    request: SalvarConexaoGitHub.Request
): Promise<SalvarConexaoGitHub.Response> => {
    exigirRuntimeTauri("GitHub")
    return invoke("salvar_conexao_github", { request })
}

export const obterConexoesGitHub = async (): Promise<ObterConexoesGitHub.Response> => {
    exigirRuntimeTauri("GitHub")
    return invoke("obter_conexoes_github")
}

export const testarConexaoGitHub = async (
    request: TestarConexaoGitHub.Request
): Promise<TestarConexaoGitHub.Response> => {
    exigirRuntimeTauri("GitHub")
    return invoke("testar_conexao_github", { request })
}

export const removerConexaoGitHub = async (
    request: RemoverConexaoGitHub.Request
): Promise<RemoverConexaoGitHub.Response> => {
    exigirRuntimeTauri("GitHub")
    return invoke("remover_conexao_github", { request })
}

export const obterRepositoriosGitHub = async (
    request: ObterRepositoriosGitHub.Request = {}
): Promise<ObterRepositoriosGitHub.Response> => {
    exigirRuntimeTauri("GitHub")
    return invoke("obter_repositorios_github", { request })
}
