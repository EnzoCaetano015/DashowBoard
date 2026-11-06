import { Enum } from "@/backend/api/enums/enum"
import { obterMensagemErro } from "@/lib/utils/error"
import type { InformacoesConfiguracoes } from "@/pages/Configuracoes/Configuracoes.types"

export const INFORMACOES_INICIAIS: InformacoesConfiguracoes = {
    caminhoBanco: "Information unavailable",
    versao: "—",
    runtime: "—",
    build: "—",
}

export const OPCOES_INTERVALO_ATUALIZACAO = [
    { valor: Enum.IntervaloAtualizacao.TrintaSegundos, titulo: "30 s" },
    { valor: Enum.IntervaloAtualizacao.UmMinuto, titulo: "1 min" },
    { valor: Enum.IntervaloAtualizacao.CincoMinutos, titulo: "5 min" },
] as const

export const OPCOES_TEMA = [
    { valor: Enum.TemaAplicacao.Escuro, titulo: "Dark" },
    { valor: Enum.TemaAplicacao.Claro, titulo: "Light" },
    { valor: Enum.TemaAplicacao.Sistema, titulo: "System" },
] as const

export const OPCOES_DENSIDADE = [
    { valor: Enum.DensidadeAplicacao.Confortavel, titulo: "Comfortable" },
    { valor: Enum.DensidadeAplicacao.Compacta, titulo: "Compact" },
] as const

export const converterIntervaloAtualizacao = (valor: string) => {
    return OPCOES_INTERVALO_ATUALIZACAO.find((opcao) => String(opcao.valor) === valor)?.valor
}

export const converterTema = (valor: string) => {
    return OPCOES_TEMA.find((opcao) => opcao.valor === valor)?.valor
}

export const converterDensidade = (valor: string) => {
    return OPCOES_DENSIDADE.find((opcao) => opcao.valor === valor)?.valor
}

export const obterTituloIntervaloAtualizacao = (valor: unknown) => {
    return OPCOES_INTERVALO_ATUALIZACAO.find((opcao) => String(opcao.valor) === String(valor))
        ?.titulo
}

export const obterTituloTema = (valor: unknown) => {
    return OPCOES_TEMA.find((opcao) => opcao.valor === valor)?.titulo
}

export const obterTituloDensidade = (valor: unknown) => {
    return OPCOES_DENSIDADE.find((opcao) => opcao.valor === valor)?.titulo
}

export const obterMensagemErroConfiguracoes = (erro: unknown) => {
    return obterMensagemErro(erro, "Unable to complete the operation.")
}
