import { describe, expect, it } from "vitest"

import { Enum } from "@/backend/api/enums/enum"
import { agregarStatus, agregarStatusServicos } from "@/lib/utils/status"

describe("agregarStatus", () => {
    it("preserva a precedência dos estados", () => {
        expect(agregarStatus([])).toBe(Enum.StatusProjeto.Desconhecido)
        expect(agregarStatus([Enum.StatusProjeto.Offline])).toBe(Enum.StatusProjeto.Offline)
        expect(
            agregarStatus([Enum.StatusProjeto.Offline, Enum.StatusProjeto.Saudavel])
        ).toBe(Enum.StatusProjeto.Degradado)
        expect(
            agregarStatus([Enum.StatusProjeto.Desconhecido, Enum.StatusProjeto.Atualizando])
        ).toBe(Enum.StatusProjeto.Desconhecido)
        expect(agregarStatus([Enum.StatusProjeto.Atualizando])).toBe(
            Enum.StatusProjeto.Atualizando
        )
    })

    it("prioriza serviços críticos e inclui o health check", () => {
        const servicos = [
            { status: Enum.StatusProjeto.Saudavel, critico: true },
            { status: Enum.StatusProjeto.Offline, critico: false },
        ]
        expect(agregarStatusServicos(servicos)).toBe(Enum.StatusProjeto.Saudavel)
        expect(agregarStatusServicos(servicos, Enum.StatusProjeto.Offline)).toBe(
            Enum.StatusProjeto.Degradado
        )
    })
})
