import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { normalizarTextoBusca } from "@/lib/utils/text"
import type { FiltrosHome, OrdenacaoProjetos } from "@/pages/Home/Home.types"

export const STATUS_PROJETO_FILTROS = [
    Enum.StatusProjeto.Saudavel,
    Enum.StatusProjeto.Degradado,
    Enum.StatusProjeto.Offline,
] as const

export const FILTROS_HOME_INICIAIS: FiltrosHome = {
    busca: "",
    status: "todos",
    provider: "todos",
    tipoServico: "todos",
    tagRepositorio: "todos",
    ordenacao: "criticidade",
}

const PRIORIDADE_STATUS: Record<Enum.StatusProjeto, number> = {
    [Enum.StatusProjeto.Offline]: 0,
    [Enum.StatusProjeto.Degradado]: 1,
    [Enum.StatusProjeto.Desconhecido]: 2,
    [Enum.StatusProjeto.Atualizando]: 3,
    [Enum.StatusProjeto.Saudavel]: 4,
}

const compararNomeProjeto = (
    primeiro: ObterProjetos.Projeto,
    segundo: ObterProjetos.Projeto
) => primeiro.nome.localeCompare(segundo.nome, "pt-BR", { sensitivity: "base" })

const contarIncidentesAtivos = (projeto: ObterProjetos.Projeto) =>
    projeto.incidentes.filter(({ status }) => status !== Enum.StatusIncidente.Resolvido).length

const obterDataVerificacao = (projeto: ObterProjetos.Projeto) => {
    if (!projeto.ultimaVerificacao) return Number.NEGATIVE_INFINITY
    const data = Date.parse(projeto.ultimaVerificacao)
    return Number.isNaN(data) ? Number.NEGATIVE_INFINITY : data
}

export const filtrarProjetos = (projetos: ObterProjetos.Projeto[], filtros: FiltrosHome) => {
    const busca = normalizarTextoBusca(filtros.busca.trim())

    return projetos.filter((projeto) => {
        if (busca && !normalizarTextoBusca(`${projeto.nome} ${projeto.descricao}`).includes(busca))
            return false
        if (filtros.status !== "todos" && projeto.status !== filtros.status) return false
        if (filtros.provider !== "todos" && !projeto.providers.includes(filtros.provider)) return false
        if (
            filtros.tipoServico !== "todos" &&
            !projeto.servicos.some((servico) => servico.tipo === filtros.tipoServico)
        )
            return false
        const tagRepositorio = filtros.tagRepositorio
        if (
            tagRepositorio !== "todos" &&
            !projeto.repositorios.some((repositorio) => repositorio.tags.includes(tagRepositorio))
        )
            return false
        return true
    })
}

export const ordenarProjetos = (
    projetos: ObterProjetos.Projeto[],
    ordenacao: OrdenacaoProjetos
) =>
    [...projetos].sort((primeiro, segundo) => {
        if (ordenacao === "nome") return compararNomeProjeto(primeiro, segundo)

        if (ordenacao === "verificacao") {
            const dataPrimeiro = obterDataVerificacao(primeiro)
            const dataSegundo = obterDataVerificacao(segundo)
            const diferenca = dataSegundo - dataPrimeiro
            return diferenca || compararNomeProjeto(primeiro, segundo)
        }

        if (ordenacao === "incidentes") {
            const diferenca = contarIncidentesAtivos(segundo) - contarIncidentesAtivos(primeiro)
            return diferenca || compararNomeProjeto(primeiro, segundo)
        }

        const diferenca = PRIORIDADE_STATUS[primeiro.status] - PRIORIDADE_STATUS[segundo.status]
        return diferenca || compararNomeProjeto(primeiro, segundo)
    })

export const contarFiltrosHomeAtivos = (filtros: FiltrosHome) =>
    Number(Boolean(filtros.busca.trim())) +
    Number(filtros.status !== "todos") +
    Number(filtros.provider !== "todos") +
    Number(filtros.tipoServico !== "todos") +
    Number(filtros.tagRepositorio !== "todos")
