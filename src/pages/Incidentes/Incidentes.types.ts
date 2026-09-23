import type { Enum } from "@/backend/api/enums/enum"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"

export type FiltrosIncidentes = {
    periodo: PeriodoMonitoramento
    busca: string
    status: Enum.StatusIncidente | "todos"
    severidade: Enum.SeveridadeIncidente | "todos"
    provider: Enum.Provider | "todos"
    projetoId: string | "todos"
}

export type ProjetoFiltroIncidente = {
    id: string
    nome: string
}
