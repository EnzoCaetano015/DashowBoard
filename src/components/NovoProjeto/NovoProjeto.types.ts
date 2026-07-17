import type { Enum } from "@/backend/api/enums/enum"
import type { ObterRepositoriosGitHub, RepositorioGitHub } from "@/backend/api/models/github.types"
import type {
    ObterProjetosRailway,
    ProjetoRailway,
    ServicoRailway,
} from "@/backend/api/models/railway.types"
import type { ObterProjetosSupabase, ProjetoSupabase } from "@/backend/api/models/supabase.types"
import type { ObterProjetosVercel, ProjetoVercel } from "@/backend/api/models/vercel.types"
import type { ModalControlProps } from "@/lib/types/modal"

export type NovoProjetoConteudoProps = ModalControlProps

export type EtapaNovoProjeto = 1 | 2 | 3 | 4 | 5

export type RepositorioSelecionado = {
    repositoryId: number
    tag: Enum.TagRepositorio
    connectionId: string
}

export type ServicoSelecionado = {
    provider: Enum.Provider
    externalProjectId: string
    externalEnvironmentId: string | null
    externalServiceId: string | null
    scopeId: string | null
    nome: string
    tipo: Enum.TipoServico
    critico: boolean
    status: Enum.StatusProjeto
    snapshot: unknown
}

export type FormularioNovoProjeto = {
    nome: string
    descricao: string
    urlAplicacao: string
    repositorios: RepositorioSelecionado[]
    servicos: ServicoSelecionado[]
    relacionamentos: Record<string, string | null>
    intervaloVerificacao: number
    timeout: number
    notificacoes: boolean
    coletarDeployments: boolean
}

export type VercelProjectsSectionProps = {
    projetos: ProjetoVercel[]
    selecionados: ServicoSelecionado[]
    runtimeDisponivel: boolean
    configurada: boolean
    isLoading: boolean
    isFetching: boolean
    falhas: ObterProjetosVercel.Falha[]
    alternar: (projeto: ProjetoVercel) => void
    atualizar: () => void
}

export type SupabaseProjectsSectionProps = {
    projetos: ProjetoSupabase[]
    selecionados: ServicoSelecionado[]
    runtimeDisponivel: boolean
    configurada: boolean
    isLoading: boolean
    isFetching: boolean
    falhas: ObterProjetosSupabase.Falha[]
    alternar: (projeto: ProjetoSupabase) => void
    atualizar: () => void
}

export type RailwayProjectsSectionProps = {
    projetos: ProjetoRailway[]
    selecionados: ServicoSelecionado[]
    runtimeDisponivel: boolean
    configurada: boolean
    isLoading: boolean
    isFetching: boolean
    falhas: ObterProjetosRailway.Falha[]
    alternar: (projeto: ProjetoRailway, servico: ServicoRailway, tipo: Enum.TipoServico) => void
    alterarTipo: (servico: ServicoSelecionado, tipo: Enum.TipoServico) => void
    alterarCriticidade: (servico: ServicoSelecionado, critico: boolean) => void
    atualizar: () => void
}

export type ServicosStepProps = {
    selecionados: ServicoSelecionado[]
    vercel: Omit<VercelProjectsSectionProps, "selecionados">
    supabase: Omit<SupabaseProjectsSectionProps, "selecionados">
    railway: Omit<RailwayProjectsSectionProps, "selecionados">
}

export type RepositoriosStepProps = {
    repositorios: RepositorioGitHub[]
    selecionados: RepositorioSelecionado[]
    runtimeDisponivel: boolean
    quantidadeConexoes: number
    isLoading: boolean
    isFetching: boolean
    falhas: ObterRepositoriosGitHub.Falha[]
    alternar: (repositorio: RepositorioGitHub) => void
    alterarTag: (repositoryId: number, tag: Enum.TagRepositorio) => void
    atualizar: () => void
}

export type InformacoesStepProps = Pick<FormularioNovoProjeto, "nome" | "descricao" | "urlAplicacao"> & {
    alterarNome: (valor: string) => void
    alterarDescricao: (valor: string) => void
    alterarUrl: (valor: string) => void
}

export type RelacionamentosStepProps = {
    repositorios: RepositorioGitHub[]
    servicos: ServicoSelecionado[]
    relacionamentos: FormularioNovoProjeto["relacionamentos"]
    alterarRelacionamento: (servico: ServicoSelecionado, repositoryId: string | null) => void
}

export type MonitoramentoStepProps = Pick<
    FormularioNovoProjeto,
    "intervaloVerificacao" | "timeout" | "notificacoes" | "coletarDeployments"
> & {
    alterarIntervalo: (valor: number) => void
    alterarTimeout: (valor: number) => void
    alterarNotificacoes: (valor: boolean) => void
    alterarColetaDeployments: (valor: boolean) => void
}
