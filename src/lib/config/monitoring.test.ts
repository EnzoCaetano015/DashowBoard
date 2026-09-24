import { describe, expect, it } from "vitest"

import {
    DIAS_HISTORICO_MONITORAMENTO,
    obterLimiteHistoricoMonitoramento,
} from "@/lib/config/monitoring"

describe("histórico do monitoramento", () => {
    it("calcula uma janela estável de 30 dias", () => {
        expect(DIAS_HISTORICO_MONITORAMENTO).toBe(30)
        expect(obterLimiteHistoricoMonitoramento(new Date("2026-09-24T12:00:00.000Z"))).toBe(
            "2026-08-25T12:00:00.000Z"
        )
    })
})
