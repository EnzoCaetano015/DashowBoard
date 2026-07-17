import type { Enum } from "@/backend/api/enums/enum"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"

export enum ProjetoQueryKeys {
    ObterProjetos = "obter-projetos",
    ObterProjetoPorId = "obter-projeto-por-id",
}

export namespace ObterProjetos {
    export type Request = void

    export type UltimoCommit = {
        sha: string
        mensagem: string
        autor: string
        data: string
    }

    export type Repositorio = {
        id: string
        externalId: string
        connectionId: string | null
        nome: string
        fullName: string
        descricao: string | null
        branch: string | null
        tags: Enum.TagRepositorio[]
        ultimoCommit: UltimoCommit | null
        statusWorkflow: Enum.StatusWorkflow | null
        issuesAbertas: number | null
        pullRequestsAbertas: number | null
        url: string | null
    }

    export type Servico = {
        id: string
        nome: string
        provider: Enum.Provider
        tipo: Enum.TipoServico
        ambiente: string
        status: Enum.StatusProjeto
        ultimoDeployment: string | null
        deploymentStatusOriginal: string | null
        tempoRespostaMs: number | null
        ultimaVerificacao: string | null
        urlExterna: string | null
        projetoRailway?: string | null
        critico: boolean
        repositorioId: string | null
        externalProjectId: string
        externalEnvironmentId: string | null
        externalServiceId: string | null
        scopeId: string | null
    }

    export type Deployment = {
        id: string
        provider: Enum.Provider
        servico: string
        status: Enum.StatusDeployment
        commit: string | null
        autor: string | null
        data: string
    }

    export type StatusRecurso = {
        id: string
        servicoId: string
        statusAnterior: Enum.StatusProjeto | null
        statusAtual: Enum.StatusProjeto
        responseTimeMs: number | null
        verificadoEm: string
    }

    export type Projeto = {
        id: string
        nome: string
        descricao: string
        status: Enum.StatusProjeto
        ultimaVerificacao: string | null
        providers: Enum.Provider[]
        repositorios: Repositorio[]
        servicos: Servico[]
        deployments: Deployment[]
        incidentes: ObterIncidentes.Incidente[]
        historicoStatus: StatusRecurso[]
        disponibilidade: number[]
        tempoResposta: number[]
        urlAplicacao?: string
        intervaloVerificacaoSegundos: number
        timeoutSegundos: number
        notificacoesAtivas: boolean
        coletarDeployments: boolean
    }

    export type Response = Projeto[]
}

export namespace ObterProjetoPorId {
    export type Request = { id?: string }
    export type Response = ObterProjetos.Projeto | undefined
}

export namespace CriarProjeto {
    export type Repositorio = {
        externalId: string
        connectionId: string | null
        nome: string
        fullName: string
        htmlUrl: string | null
        tag: Enum.TagRepositorio
        snapshot: RepositorioGitHub
    }

    export type Servico = {
        provider: Enum.Provider
        externalProjectId: string
        externalEnvironmentId: string | null
        externalServiceId: string | null
        scopeId: string | null
        nome: string
        tipo: Enum.TipoServico
        critico: boolean
        repositorioExternalId: string | null
        status: Enum.StatusProjeto
        snapshot: unknown
    }

    export type Request = {
        nome: string
        descricao: string
        urlAplicacao: string | null
        repositorios: Repositorio[]
        servicos: Servico[]
        intervaloVerificacaoSegundos: number
        timeoutSegundos: number
        notificacoesAtivas: boolean
        coletarDeployments: boolean
    }

    export type Response = ObterProjetos.Projeto
}

export namespace AtualizarProjeto {
    export type Request = {
        id: string
        nome?: string
        descricao?: string
        urlAplicacao?: string | null
        intervaloVerificacaoSegundos?: number
        timeoutSegundos?: number
        notificacoesAtivas?: boolean
        coletarDeployments?: boolean
    }
    export type Response = ObterProjetos.Projeto
}

export namespace ExcluirProjeto {
    export type Request = { id: string }
    export type Response = void
}

export namespace SalvarSnapshotServico {
    export type Request = {
        servicoId: string
        status: Enum.StatusProjeto
        snapshot?: unknown
        responseTimeMs?: number | null
    }
    export type Response = void
}
