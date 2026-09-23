import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export type ProjectSettingsProps = {
    projeto: ObterProjetos.Projeto
    onEditar: () => void
}
