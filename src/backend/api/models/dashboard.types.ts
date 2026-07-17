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
        desconhecidos: number
        servicosMonitorados: number
        incidentesAbertos: number
        incidentes: number
        tendencias: {
            projetos: number[]
            saudaveis: number[]
            degradados: number[]
            offline: number[]
            desconhecidos: number[]
            servicos: number[]
            incidentesAbertos: number[]
            incidentes: number[]
        }
    }

    export type Response = {
        metricas: Metricas
        projetos: ObterProjetos.Projeto[]
    }
}
