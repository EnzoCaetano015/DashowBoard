import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export type ProjectServiceActionsProps = {
    servico: ObterProjetos.Servico
    atualizando: boolean
    onAtualizar: (servico: ObterProjetos.Servico) => void
}
