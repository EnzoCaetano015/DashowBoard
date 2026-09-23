import { Enum } from "@/backend/api/enums/enum"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import { normalizarTextoBusca } from "@/lib/utils/text"
import type {
    FiltrosIncidentes,
    ProjetoFiltroIncidente,
} from "@/pages/Incidentes/Incidentes.types"

export const FILTROS_INCIDENTES_INICIAIS: FiltrosIncidentes = {
    periodo: 15,
    busca: "",
    status: "todos",
    severidade: "todos",
    provider: "todos",
    projetoId: "todos",
}

export const LABEL_STATUS_INCIDENTE: Record<Enum.StatusIncidente, string> = {
    [Enum.StatusIncidente.EmAndamento]: "Em andamento",
    [Enum.StatusIncidente.Monitorando]: "Monitorando",
    [Enum.StatusIncidente.Resolvido]: "Resolvido",
}

export const LABEL_SEVERIDADE_INCIDENTE: Record<Enum.SeveridadeIncidente, string> = {
    [Enum.SeveridadeIncidente.Baixa]: "Baixa",
    [Enum.SeveridadeIncidente.Media]: "Média",
    [Enum.SeveridadeIncidente.Alta]: "Alta",
}

export const filtrarIncidentes = (
    incidentes: ObterIncidentes.Incidente[],
    filtros: FiltrosIncidentes
) => {
    const termo = normalizarTextoBusca(filtros.busca.trim())
    const limite = Date.now() - filtros.periodo * 24 * 60 * 60 * 1000

    return incidentes
        .filter((incidente) => {
            const iniciadoEm = Date.parse(incidente.iniciadoEm)
            if (Number.isNaN(iniciadoEm) || iniciadoEm < limite) return false
            if (filtros.status !== "todos" && incidente.status !== filtros.status) return false
            if (filtros.severidade !== "todos" && incidente.severidade !== filtros.severidade)
                return false
            if (filtros.provider !== "todos" && incidente.provider !== filtros.provider) return false
            if (filtros.projetoId !== "todos" && incidente.projetoId !== filtros.projetoId) return false
            if (!termo) return true

            return normalizarTextoBusca(
                [
                    incidente.titulo,
                    incidente.descricao,
                    incidente.projetoNome,
                    incidente.servico,
                    incidente.provider,
                ]
                    .filter(Boolean)
                    .join(" ")
            ).includes(termo)
        })
        .sort((primeiro, segundo) => {
            const primeiroAtivo = primeiro.status !== Enum.StatusIncidente.Resolvido
            const segundoAtivo = segundo.status !== Enum.StatusIncidente.Resolvido
            if (primeiroAtivo !== segundoAtivo) return primeiroAtivo ? -1 : 1
            return Date.parse(segundo.iniciadoEm) - Date.parse(primeiro.iniciadoEm)
        })
}

export const obterProjetosFiltroIncidentes = (
    incidentes: ObterIncidentes.Incidente[]
): ProjetoFiltroIncidente[] => {
    const projetos = new Map<string, string>()
    for (const incidente of incidentes) projetos.set(incidente.projetoId, incidente.projetoNome)

    return [...projetos]
        .map(([id, nome]) => ({ id, nome }))
        .sort((primeiro, segundo) =>
            primeiro.nome.localeCompare(segundo.nome, "pt-BR", { sensitivity: "base" })
        )
}

export const contarFiltrosIncidentesAtivos = (filtros: FiltrosIncidentes) =>
    Number(filtros.periodo !== FILTROS_INCIDENTES_INICIAIS.periodo) +
    Number(Boolean(filtros.busca.trim())) +
    Number(filtros.status !== "todos") +
    Number(filtros.severidade !== "todos") +
    Number(filtros.provider !== "todos") +
    Number(filtros.projetoId !== "todos")
