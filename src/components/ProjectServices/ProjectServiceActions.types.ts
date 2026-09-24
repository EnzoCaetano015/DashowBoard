import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export type ProjectServiceActionsProps = {
    servico: ObterProjetos.Servico
    onAtualizar: () => void
}
