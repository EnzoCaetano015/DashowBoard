import type { Enum } from "@/backend/api/enums/enum"

export enum VercelQueryKeys {
    Conexao = "vercel-conexao",
    Projetos = "vercel-projetos",
}

export type ErroVercel = {
    code: string
    message: string
    resetAt?: string | null
}

export type ConexaoVercel = {
    userId: string
    username: string
    nome: string | null
    avatarUrl: string | null
    quantidadeTimes: number
    quantidadeProjetos: number
    ultimaSincronizacao: string
    status: Enum.StatusIntegracao
    erro?: string | null
    erroCodigo?: string | null
}

export type EscopoVercel = {
    id: string | null
    nome: string
    slug: string | null
    tipo: "personal" | "team"
}

export type DeploymentVercel = {
    id: string
    nome: string
    url: string | null
    estado: Enum.StatusDeployment | null
    estadoOriginal: string
    target: string | null
    createdAt: string
    readyAt: string | null
    branch: string | null
    commitSha: string | null
    commitMessage: string | null
}

export type ProjetoVercel = {
    id: string
    nome: string
    accountId: string
    escopo: EscopoVercel
    framework: string | null
    createdAt: string
    updatedAt: string
    productionUrl: string | null
    gitRepository: {
        tipo: string
        repositorio: string
        organizacao: string | null
    } | null
    ultimoDeployment: DeploymentVercel | null
}

export namespace SalvarConexaoVercel {
    export type Request = { token: string }
    export type Response = ConexaoVercel
}

export namespace ObterConexaoVercel {
    export type Request = void
    export type Response = ConexaoVercel | null
}

export namespace TestarConexaoVercel {
    export type Request = void
    export type Response = ConexaoVercel
}

export namespace RemoverConexaoVercel {
    export type Request = void
    export type Response = void
}

export namespace ObterProjetosVercel {
    export type Request = void
    export type Falha = {
        scopeId: string | null
        scopeName: string
        code: string
        message: string
        resetAt?: string | null
    }
    export type Response = {
        projects: ProjetoVercel[]
        failures: Falha[]
    }
}
