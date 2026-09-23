import type { Enum } from "@/backend/api/enums/enum"

export enum PreferenciasQueryKeys {
    ObterPreferencias = "obter-preferencias-aplicacao",
    ObterInformacoesDesktop = "obter-informacoes-desktop",
}

export type PreferenciasAplicacao = {
    iniciarComSistema: boolean
    verificacaoSegundoPlano: boolean
    intervaloPadraoSegundos: Enum.IntervaloAtualizacao
    notificacoesSistema: boolean
    somIncidente: boolean
    badgeIcone: boolean
    tema: Enum.TemaAplicacao
    densidade: Enum.DensidadeAplicacao
    nomeDesenvolvedor: string
    sidebarCompacta: boolean
}

export namespace ObterPreferencias {
    export type Request = void
    export type Response = PreferenciasAplicacao
}

export namespace SalvarPreferencias {
    export type Request = PreferenciasAplicacao
    export type Response = PreferenciasAplicacao
}

export namespace ObterInformacoesDesktop {
    export type Request = void
    export type Response = {
        caminhoBanco: string
        versao: string
        runtime: string
        build: string
    }
}

export namespace RevelarBancoDados {
    export type Request = void
    export type Response = void
}

export namespace ExportarBackupBancoDados {
    export type Request = void
    export type Response = string
}
