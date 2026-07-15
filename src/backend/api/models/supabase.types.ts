import type { Enum } from "@/backend/api/enums/enum"

export enum SupabaseQueryKeys {
    Conexao = "supabase-conexao",
    Projetos = "supabase-projetos",
}

export type ErroSupabase = {
    code: string
    message: string
    resetAt?: string | null
}

export type ConexaoSupabase = {
    userId: string
    username: string
    email: string
    quantidadeOrganizacoes: number
    quantidadeProjetos: number
    ultimaSincronizacao: string
    status: Enum.StatusIntegracao
    erro?: string | null
    erroCodigo?: string | null
}

export type OrganizacaoSupabase = {
    id: string
    slug: string
    nome: string
}

export type BancoSupabase = {
    identifier: string
    tipo: string
    statusOriginal: string
    status: Enum.StatusProjeto
    computeSize: string | null
    regiao: string | null
    cloudProvider: string | null
}

export type ProjetoSupabase = {
    ref: string
    nome: string
    organizacaoId: string
    organizacaoSlug: string
    organizacaoNome: string
    cloudProvider: string | null
    regiao: string | null
    branch: boolean
    statusOriginal: string
    status: Enum.StatusProjeto
    criadoEm: string
    banco: BancoSupabase | null
    dashboardUrl: string
}

export namespace SalvarConexaoSupabase {
    export type Request = { token: string }
    export type Response = ConexaoSupabase
}

export namespace ObterConexaoSupabase {
    export type Request = void
    export type Response = ConexaoSupabase | null
}

export namespace TestarConexaoSupabase {
    export type Request = void
    export type Response = ConexaoSupabase
}

export namespace RemoverConexaoSupabase {
    export type Request = void
    export type Response = void
}

export namespace ObterProjetosSupabase {
    export type Request = void
    export type Falha = {
        organizacaoId: string
        organizacaoSlug: string
        organizacaoNome: string
        code: string
        message: string
        resetAt?: string | null
    }
    export type Response = {
        projects: ProjetoSupabase[]
        failures: Falha[]
    }
}
