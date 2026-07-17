import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export type ProjectHeaderProps = {
    projeto: ObterProjetos.Projeto
    atualizando: boolean
    onAtualizar: () => void
    onEditar: () => void
    onExcluir: () => void
}
