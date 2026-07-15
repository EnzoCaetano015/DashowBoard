import type { Enum } from "@/backend/api/enums/enum"
import type { ObterRepositoriosGitHub, RepositorioGitHub } from "@/backend/api/models/github.types"

export type EtapaNovoProjeto = 1 | 2 | 3 | 4 | 5

export type RepositorioSelecionado = {
    repositoryId: number
    tag: Enum.TagRepositorio
    connectionId: string
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

export type RepositoriosStepProps = {
    repositorios: RepositorioGitHub[]
    selecionados: RepositorioSelecionado[]
    runtimeDisponivel: boolean
    quantidadeConexoes: number
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    erro?: string
    falhas: ObterRepositoriosGitHub.Falha[]
    alternar: (repositorio: RepositorioGitHub) => void
    alterarTag: (repositoryId: number, tag: Enum.TagRepositorio) => void
    tentarNovamente: () => void
    atualizar: () => void
}
