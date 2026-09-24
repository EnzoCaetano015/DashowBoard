import type { Enum } from "@/backend/api/enums/enum"

export enum IncidenteQueryKeys {
    ObterIncidentes = "obter-incidentes",
}

export namespace ObterIncidentes {
    export type Request = void

    export type Incidente = {
        id: string
        projetoId: string
        projetoNome: string
        titulo: string
        descricao: string | null
        servicoId: string | null
        servico: string
        provider: Enum.Provider | null
        origem: Enum.OrigemIncidente
        notificacoesAtivas: boolean
        status: Enum.StatusIncidente
        severidade: Enum.SeveridadeIncidente
        iniciadoEm: string
        duracaoMinutos: number
        resolvidoEm: string | null
    }

    export type Response = Incidente[]
}
