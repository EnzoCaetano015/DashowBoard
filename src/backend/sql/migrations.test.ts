import { describe, expect, it, vi } from "vitest"

import { executarMigracoes } from "@/backend/sql/migrations"
import type { OperacaoSqlite } from "@/backend/sql/transaction"

type OpcoesBanco = {
    colunasServicos?: string[]
    colunasIncidentes?: string[]
    objetos?: string[]
    falharQuando?: string
}

const criarBanco = (opcoes: OpcoesBanco = {}) => {
    const execucoes: string[] = []
    let falhou = false
    const select = async <T>(query: string): Promise<T> => {
        let resultado: unknown = []
        if (query.includes("SELECT versao FROM migracoes")) {
            resultado = [{ versao: 1 }, { versao: 2 }, { versao: 3 }]
        } else if (query.includes("table_info(projeto_servicos)")) {
            resultado = (opcoes.colunasServicos ?? []).map((name) => ({ name }))
        } else if (query.includes("table_info(incidentes)")) {
            resultado = (opcoes.colunasIncidentes ?? []).map((name) => ({ name }))
        } else if (query.includes("sqlite_master")) {
            resultado = (opcoes.objetos ?? []).map((name) => ({ name }))
        }
        return resultado as T
    }
    const database = {
        execute: vi.fn(async (query: string) => {
            execucoes.push(query.trim())
            if (!falhou && opcoes.falharQuando && query.includes(opcoes.falharQuando)) {
                falhou = true
                throw new Error("falha simulada")
            }
            return { rowsAffected: 0 }
        }),
        select,
    }
    const executarTransacao = async (operacoes: OperacaoSqlite[]) => {
        execucoes.push("BEGIN IMMEDIATE")
        for (const { query } of operacoes) {
            if (!falhou && opcoes.falharQuando && query.includes(opcoes.falharQuando)) {
                falhou = true
                execucoes.push("ROLLBACK")
                throw new Error("falha simulada")
            }
            execucoes.push(query.trim())
        }
        execucoes.push("COMMIT")
    }

    return { database, executarTransacao, execucoes }
}

describe("executarMigracoes", () => {
    it("aplica e registra a migration pendente na mesma transação", async () => {
        const { database, executarTransacao, execucoes } = criarBanco()

        await executarMigracoes(database, executarTransacao)

        const inicio = execucoes.indexOf("BEGIN IMMEDIATE")
        const registro = execucoes.findIndex((query) => query.startsWith("INSERT INTO migracoes"))
        const commit = execucoes.indexOf("COMMIT")
        expect(inicio).toBeGreaterThan(-1)
        expect(registro).toBeGreaterThan(inicio)
        expect(commit).toBeGreaterThan(registro)
        expect(execucoes).not.toContain("ROLLBACK")
    })

    it("executa rollback quando um comando da migration falha", async () => {
        const { database, executarTransacao, execucoes } = criarBanco({
            falharQuando: "ADD COLUMN origem",
        })

        await expect(executarMigracoes(database, executarTransacao)).rejects.toThrow(
            "falha simulada"
        )

        expect(execucoes).toContain("ROLLBACK")
        expect(execucoes).not.toContain("COMMIT")
        expect(execucoes.some((query) => query.startsWith("INSERT INTO migracoes"))).toBe(false)
    })

    it("retoma uma v4 parcial aplicando somente os elementos ausentes", async () => {
        const { database, executarTransacao, execucoes } = criarBanco({
            colunasServicos: ["mensagem_status"],
            objetos: ["verificacoes_projeto"],
        })

        await executarMigracoes(database, executarTransacao)

        expect(execucoes.some((query) => query.includes("ADD COLUMN mensagem_status"))).toBe(false)
        expect(execucoes.some((query) => query.includes("CREATE TABLE IF NOT EXISTS verificacoes_projeto"))).toBe(
            false
        )
        expect(execucoes.some((query) => query.includes("ADD COLUMN origem"))).toBe(true)
        expect(execucoes.some((query) => query.includes("ix_verificacoes_projeto_data"))).toBe(true)
        expect(execucoes.some((query) => query.includes("ux_incidente_health_check_aberto"))).toBe(true)
        expect(execucoes).toContain("COMMIT")
    })
})
