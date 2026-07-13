import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"

export enum DashboardQueryKeys {
    ObterDashboard = "obter-dashboard",
}

export namespace ObterDashboard {
    export type Request = {
        periodo: PeriodoMonitoramento
    }

    export type Metricas = {
        totalProjetos: number
        saudaveis: number
        degradados: number
        offline: number
        servicosMonitorados: number
        incidentes: number
        tendencias: {
            projetos: number[]
            saudaveis: number[]
            degradados: number[]
            offline: number[]
            servicos: number[]
            incidentes: number[]
        }
    }

    export type Response = {
        metricas: Metricas
        projetos: ObterProjetos.Projeto[]
    }
}
