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
        online: number
        degradados: number
        offline: number
        servicosMonitorados: number
        tendencias: {
            projetos: number[]
            online: number[]
            degradados: number[]
            offline: number[]
            servicos: number[]
        }
    }

    export type Response = {
        metricas: Metricas
        projetos: ObterProjetos.Projeto[]
    }
}
