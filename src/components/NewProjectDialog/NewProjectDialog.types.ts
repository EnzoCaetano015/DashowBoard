import type { Enum } from "@/backend/api/enums/enum"
import type { ObterRepositoriosGitHub, RepositorioGitHub } from "@/backend/api/models/github.types"
import type { ObterProjetosSupabase, ProjetoSupabase } from "@/backend/api/models/supabase.types"
import type { ObterProjetosVercel, ProjetoVercel } from "@/backend/api/models/vercel.types"

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

export type ServicoSelecionado = {
    provider: Enum.Provider.Vercel | Enum.Provider.Supabase
    externalProjectId: string
    scopeId: string | null
    tipo: Enum.TipoServico
}

export type VercelProjectsSectionProps = {
    projetos: ProjetoVercel[]
    selecionados: ServicoSelecionado[]
    runtimeDisponivel: boolean
    configurada: boolean
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    erro?: string
    falhas: ObterProjetosVercel.Falha[]
    alternar: (projeto: ProjetoVercel) => void
    tentarNovamente: () => void
    atualizar: () => void
}

export type SupabaseProjectsSectionProps = {
    projetos: ProjetoSupabase[]
    selecionados: ServicoSelecionado[]
    runtimeDisponivel: boolean
    configurada: boolean
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    erro?: string
    falhas: ObterProjetosSupabase.Falha[]
    alternar: (projeto: ProjetoSupabase) => void
    tentarNovamente: () => void
    atualizar: () => void
}

export type ServicosStepProps = {
    selecionados: ServicoSelecionado[]
    vercel: Omit<VercelProjectsSectionProps, "selecionados">
    supabase: Omit<SupabaseProjectsSectionProps, "selecionados">
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
