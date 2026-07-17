import type { Enum } from "@/backend/api/enums/enum"

export namespace ObterIntegracoes {
    export type Request = void

    export type Integracao = {
        provider: Enum.Provider
        conta: string
        status: Enum.StatusIntegracao
        erro?: string
        ultimaSincronizacao: string
    }

    export type Response = Integracao[]
}
