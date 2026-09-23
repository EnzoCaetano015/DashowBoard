import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"

export type IntegrationCardProps = {
    integracao: ObterIntegracoes.Integracao
    podeTestar: boolean
    isTesting: boolean
    onTestar: () => void
    onConfigurar: () => void
}
