import { invoke } from "@tauri-apps/api/core"

import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export type OperacaoSqlite = {
    query: string
    values?: unknown[]
}

export const executarTransacaoSqlite = async (operacoes: OperacaoSqlite[]) => {
    if (operacoes.length === 0) return
    exigirRuntimeTauri("SQLite")
    await invoke("executar_transacao_sqlite", {
        operacoes,
    })
}
