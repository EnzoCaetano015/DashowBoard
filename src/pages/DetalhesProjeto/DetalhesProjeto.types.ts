export const ABAS_DETALHES_PROJETO = [
    "visao-geral",
    "servicos",
    "repositorios",
    "historico",
    "configuracoes",
] as const

export type AbaDetalhesProjeto = (typeof ABAS_DETALHES_PROJETO)[number]
