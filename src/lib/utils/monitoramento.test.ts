import { describe, expect, it } from "vitest"

import { Enum } from "@/backend/api/enums/enum"
import { resolverAtualizacaoMonitoramento } from "@/lib/utils/monitoramento"

describe("resolverAtualizacaoMonitoramento", () => {
    it("não interpreta carregamento inicial como recurso ausente", () => {
        expect(
            resolverAtualizacaoMonitoramento({ servicoId: "1", coletaConcluida: false })
        ).toBeNull()
    })

    it("limpa a mensagem quando o recurso volta a ser encontrado", () => {
        expect(
            resolverAtualizacaoMonitoramento({
                servicoId: "1",
                coletaConcluida: true,
                recurso: { status: Enum.StatusProjeto.Saudavel, snapshot: { id: "remoto" } },
            })
        ).toMatchObject({
            status: Enum.StatusProjeto.Saudavel,
            mensagemStatus: null,
        })
    })

    it("diferencia recurso ausente, falha parcial e erro completo", () => {
        expect(
            resolverAtualizacaoMonitoramento({ servicoId: "1", coletaConcluida: true })
        ).toMatchObject({
            status: Enum.StatusProjeto.Desconhecido,
            mensagemStatus: "Recurso não localizado no provider.",
        })
        expect(
            resolverAtualizacaoMonitoramento({
                servicoId: "1",
                coletaConcluida: true,
                mensagemFalhaParcial: "Escopo indisponível.",
            })
        ).toMatchObject({ mensagemStatus: "Escopo indisponível." })
        expect(
            resolverAtualizacaoMonitoramento({
                servicoId: "1",
                coletaConcluida: true,
                erro: new Error("Provider indisponível."),
            })
        ).toMatchObject({ mensagemStatus: "Provider indisponível." })
    })
})
