import type Database from "@tauri-apps/plugin-sql"

import { executarMigracoes } from "@/backend/sql/migrations"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

const NOME_BANCO_DADOS = "data.sqlite"
const URL_BANCO_DADOS = `sqlite:${NOME_BANCO_DADOS}`

let databasePromise: Promise<Database> | undefined

const carregarBancoDados = async () => {
    exigirRuntimeTauri()

    const { default: Database } = await import("@tauri-apps/plugin-sql")
    const database = await Database.load(URL_BANCO_DADOS)
    await database.execute("PRAGMA foreign_keys = ON")
    await executarMigracoes(database)
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
