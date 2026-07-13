import type { Enum } from "@/backend/api/enums/enum"

export type EtapaNovoProjeto = 1 | 2 | 3 | 4 | 5

export type RepositorioDisponivel = {
    id: string
    nome: string
    tag: Enum.TagRepositorio
}

export type ServicoDisponivel = {
    id: string
    nome: string
    provider: Enum.Provider
    tipo: Enum.TipoServico
}

export type NewProjectStepProps = {
    selecionados: string[]
    alternar: (id: string) => void
}
