import type { Enum } from "@/backend/api/enums/enum"

export type ErroGitHub = {
    code: string
    message: string
    resetAt?: string | null
}

export type ConexaoGitHub = {
    id: string
    nome: string
    resourceOwner: string
    tipo: Enum.TipoConexaoGitHub
    login: string
    avatarUrl: string
    status: Enum.StatusIntegracao
    quantidadeRepositorios: number
    ultimaSincronizacao: string
    erro?: string | null
    erroCodigo?: string | null
}

export type RepositorioGitHub = {
    id: number
    nodeId: string
    nome: string
    fullName: string
    ownerLogin: string
    ownerAvatarUrl: string
    description: string | null
    private: boolean
    fork: boolean
    archived: boolean
    htmlUrl: string
    defaultBranch: string
    language: string | null
    topics: string[]
    updatedAt: string
    pushedAt: string | null
    connectionId: string
    connectionName: string
}

export namespace SalvarConexaoGitHub {
    export type Request = {
        connectionId?: string
        nome: string
        resourceOwner: string
        tipo: Enum.TipoConexaoGitHub
        token: string
    }

    export type Response = ConexaoGitHub
}

export namespace ObterConexoesGitHub {
    export type Request = void
    export type Response = ConexaoGitHub[]
}

export namespace TestarConexaoGitHub {
    export type Request = { connectionId: string }
    export type Response = ConexaoGitHub
}

export namespace RemoverConexaoGitHub {
    export type Request = { connectionId: string }
    export type Response = void
}

export namespace ObterRepositoriosGitHub {
    export type Request = { connectionIds?: string[] }
    export type Falha = {
        connectionId: string
        connectionName: string
        code: string
        message: string
        resetAt?: string | null
    }
    export type Response = {
        repositories: RepositorioGitHub[]
        failures: Falha[]
    }
}
