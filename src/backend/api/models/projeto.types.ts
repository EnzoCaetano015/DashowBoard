import type { Enum } from "@/backend/api/enums/enum"
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
        nome: string
        descricao: string
        branch: string
        tags: Enum.TagRepositorio[]
        ultimoCommit: UltimoCommit
        statusWorkflow: Enum.StatusWorkflow
        issuesAbertas: number
        pullRequestsAbertas: number
        url: string
    }

    export type Servico = {
        id: string
        nome: string
        provider: Enum.Provider
        tipo: Enum.TipoServico
        ambiente: string
        status: Enum.StatusProjeto
        ultimoDeployment: string
        tempoRespostaMs: number
        ultimaVerificacao: string
        urlExterna: string
        projetoRailway?: string
        critico: boolean
    }

    export type Deployment = {
        id: string
        provider: Enum.Provider
        servico: string
        status: Enum.StatusDeployment
        commit: string
        autor: string
        data: string
    }

    export type Projeto = {
        id: string
        nome: string
        descricao: string
        status: Enum.StatusProjeto
        ultimaVerificacao: string
        providers: Enum.Provider[]
        repositorios: Repositorio[]
        servicos: Servico[]
        deployments: Deployment[]
        incidentes: ObterIncidentes.Incidente[]
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
    export type Request = {
        id?: string
    }

    export type Response = ObterProjetos.Projeto | undefined
}
