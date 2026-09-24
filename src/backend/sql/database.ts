import type Database from "@tauri-apps/plugin-sql"

import { executarMigracoes } from "@/backend/sql/migrations"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

const NOME_BANCO_DADOS = "data.sqlite"
const URL_BANCO_DADOS = `sqlite:${NOME_BANCO_DADOS}`

let databasePromise: Promise<Database> | undefined

const TABELAS_NECESSARIAS = [
    "incidentes",
    "migracoes",
    "preferencias_aplicacao",
    "projeto_repositorios",
    "projeto_servicos",
    "projetos",
    "status_recursos",
    "verificacoes_projeto",
] as const

const validarBancoDadosDesenvolvimento = async (database: Database) => {
    if (!import.meta.env.DEV) return

    const violacoes = await database.select<unknown[]>("PRAGMA foreign_key_check")
    if (violacoes.length > 0) {
        throw new Error(`O banco possui ${violacoes.length} violação(ões) de chave estrangeira.`)
    }

    const tabelas = await database.select<Array<{ name: string }>>(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    )
    const nomesTabelas = new Set(tabelas.map(({ name }) => name))
    const tabelasAusentes = TABELAS_NECESSARIAS.filter((nome) => !nomesTabelas.has(nome))

    if (tabelasAusentes.length > 0) {
        throw new Error(`Tabelas ausentes no banco: ${tabelasAusentes.join(", ")}.`)
    }
}

const carregarBancoDados = async () => {
    exigirRuntimeTauri()

    const { default: Database } = await import("@tauri-apps/plugin-sql")
    const database = await Database.load(URL_BANCO_DADOS)
    await database.execute("PRAGMA foreign_keys = ON")
    await executarMigracoes(database)
    await validarBancoDadosDesenvolvimento(database)
    return database
}

const obterSufixoBackup = () => {
    return new Date().toISOString().replace(/:/g, "-").replace("T", "_").replace("Z", "")
}

export const obterBancoDados = () => {
    databasePromise ??= carregarBancoDados().catch((erro: unknown) => {
        databasePromise = undefined
        throw erro
    })
    return databasePromise
}

export const obterCaminhoBancoDados = async () => {
    exigirRuntimeTauri()

    const { appConfigDir, join } = await import("@tauri-apps/api/path")
    return join(await appConfigDir(), NOME_BANCO_DADOS)
}

export const revelarBancoDados = async () => {
    await obterBancoDados()

    const [{ revealItemInDir }, caminho] = await Promise.all([
        import("@tauri-apps/plugin-opener"),
        obterCaminhoBancoDados(),
    ])

    await revealItemInDir(caminho)
}

export const exportarBackupBancoDados = async () => {
    const database = await obterBancoDados()
    const [{ downloadDir, join }, { revealItemInDir }] = await Promise.all([
        import("@tauri-apps/api/path"),
        import("@tauri-apps/plugin-opener"),
    ])
    const destino = await join(await downloadDir(), `dashowboard-backup-${obterSufixoBackup()}.sqlite`)

    await database.execute("VACUUM INTO $1", [destino])
    await revealItemInDir(destino)

    return destino
}
