import { invoke } from "@tauri-apps/api/core"

import type {
    ObterConexaoRailway,
    ObterProjetosRailway,
    RemoverConexaoRailway,
    SalvarConexaoRailway,
    TestarConexaoRailway,
} from "@/backend/api/models/railway.types"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export const salvarConexaoRailway = (request: SalvarConexaoRailway.Request) => {
    exigirRuntimeTauri("Railway")
    return invoke<SalvarConexaoRailway.Response>("salvar_conexao_railway", { request })
}

export const obterConexaoRailway = () => {
    exigirRuntimeTauri("Railway")
    return invoke<ObterConexaoRailway.Response>("obter_conexao_railway")
}

export const testarConexaoRailway = () => {
    exigirRuntimeTauri("Railway")
    return invoke<TestarConexaoRailway.Response>("testar_conexao_railway")
}

export const removerConexaoRailway = () => {
    exigirRuntimeTauri("Railway")
    return invoke<RemoverConexaoRailway.Response>("remover_conexao_railway")
}

export const obterProjetosRailway = () => {
    exigirRuntimeTauri("Railway")
    return invoke<ObterProjetosRailway.Response>("obter_projetos_railway")
}
