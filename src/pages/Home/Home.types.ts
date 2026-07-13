import type { Enum } from "@/backend/api/enums/enum"

export type FiltrosHome = {
    busca: string
    status: Enum.StatusProjeto | "todos"
    provider: Enum.Provider | "todos"
    tipoServico: Enum.TipoServico | "todos"
    tagRepositorio: Enum.TagRepositorio | "todos"
}

export type FiltroSelectProps = {
    value: string
    placeholder: string
    onValueChange: (valor: string) => void
    opcoes: ReadonlyArray<readonly [string, string]>
}
