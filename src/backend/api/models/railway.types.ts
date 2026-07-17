import type { Enum } from "@/backend/api/enums/enum"

export enum RailwayQueryKeys {
    Conexao = "railway-conexao",
    Projetos = "railway-projetos",
}

export type ErroRailway = {
    code: string
    message: string
    resetAt?: string | null
    rateLimit?: number | null
    rateLimitRemaining?: number | null
}

export type ConexaoRailway = {
    userId: string
    nome: string
    email: string
    avatarUrl: string | null
    quantidadeWorkspaces: number
    quantidadeProjetos: number
    ultimaSincronizacao: string
    status: Enum.StatusIntegracao
    erro?: string | null
    erroCodigo?: string | null
}

export type WorkspaceRailway = {
    id: string | null
    nome: string
    tipo: "personal" | "workspace"
}

export type UsoRailway = {
    valorAtual: number | null
    unidade: string | null
    saldoCreditos: number | null
    saldoDisponivelNaApi: boolean
    atualizadoEm: string
}

export type ServicoRailway = {
    id: string
    nome: string
    environmentId: string
    environmentName: string
    regiao: string | null
    replicas: number | null
    healthcheckPath: string | null
    deploymentId: string | null
    deploymentStatusOriginal: string | null
    status: Enum.StatusProjeto
    deploymentCriadoEm: string | null
}

export type AmbienteRailway = {
    id: string
    nome: string
    servicos: ServicoRailway[]
}

export type ProjetoRailway = {
    id: string
    nome: string
    descricao: string | null
    workspaceId: string | null
    workspaceNome: string
    criadoEm: string
    atualizadoEm: string
    status: Enum.StatusProjeto
    ambientes: AmbienteRailway[]
    uso: UsoRailway | null
}

export namespace SalvarConexaoRailway {
    export type Request = { token: string }
    export type Response = ConexaoRailway
}

export namespace ObterConexaoRailway {
    export type Request = void
    export type Response = ConexaoRailway | null
}

export namespace TestarConexaoRailway {
    export type Request = void
    export type Response = ConexaoRailway
}

export namespace RemoverConexaoRailway {
    export type Request = void
    export type Response = void
}

export namespace ObterProjetosRailway {
    export type Request = void
    export type Falha = {
        workspaceId: string | null
        workspaceName: string
        projectId: string | null
        code: string
        message: string
        resetAt?: string | null
        rateLimit?: number | null
        rateLimitRemaining?: number | null
    }
    export type Response = {
        projects: ProjetoRailway[]
        failures: Falha[]
    }
}
