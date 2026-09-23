import type { Enum } from "@/backend/api/enums/enum"

export type OrdenacaoProjetos = "criticidade" | "nome" | "verificacao" | "incidentes"

export type FiltrosHome = {
    busca: string
    status: Enum.StatusProjeto | "todos"
    provider: Enum.Provider | "todos"
    tipoServico: Enum.TipoServico | "todos"
    tagRepositorio: Enum.TagRepositorio | "todos"
    ordenacao: OrdenacaoProjetos
}
