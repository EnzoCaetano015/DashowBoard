import { useMemo, useState } from "react"

import { useObterIncidentes } from "@/backend/api/controllers/incidente"
import { Enum } from "@/backend/api/enums/enum"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import type { FiltrosIncidentes } from "@/pages/Incidentes/Incidentes.types"
import {
    contarFiltrosIncidentesAtivos,
    FILTROS_INCIDENTES_INICIAIS,
    filtrarIncidentes,
    obterProjetosFiltroIncidentes,
} from "@/pages/Incidentes/Incidentes.utils"

export const useIncidentes = () => {
    const [filtros, setFiltros] = useState<FiltrosIncidentes>(FILTROS_INCIDENTES_INICIAIS)

    const {
        data: incidentes = [],
        isLoading: incidentesIsLoading,
        isError: incidentesIsError,
        refetch: atualizarIncidentes,
    } = useObterIncidentes()

    const filtrados = useMemo(() => filtrarIncidentes(incidentes, filtros), [filtros, incidentes])
    const projetos = useMemo(() => obterProjetosFiltroIncidentes(incidentes), [incidentes])

    const alterarFiltro = <Campo extends keyof FiltrosIncidentes>(
        campo: Campo,
        valor: FiltrosIncidentes[Campo]
    ) => setFiltros((atuais) => ({ ...atuais, [campo]: valor }))

    return {
        filtros,
        incidentes: filtrados,
        projetos,
        quantidadeFiltrosAtivos: contarFiltrosIncidentesAtivos(filtros),
        emAndamento: filtrados.filter((incidente) => incidente.status !== Enum.StatusIncidente.Resolvido)
            .length,
        resolvidos: filtrados.filter((incidente) => incidente.status === Enum.StatusIncidente.Resolvido)
            .length,
        projetosMonitorados: new Set(filtrados.map((incidente) => incidente.projetoId)).size,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: incidentesIsLoading,
        isError: incidentesIsError,
        atualizar: atualizarIncidentes,
        alterarFiltro,
        limparFiltros: () => setFiltros(FILTROS_INCIDENTES_INICIAIS),
    }
}
