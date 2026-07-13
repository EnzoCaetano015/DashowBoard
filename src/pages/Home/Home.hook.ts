import { useMemo, useState } from "react"

import { useObterDashboard } from "@/backend/api/controllers/projeto"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"
import type { FiltrosHome } from "@/pages/Home/Home.types"
import { FILTROS_HOME_INICIAIS, filtrarProjetos } from "@/pages/Home/Home.utils"

export const useHome = () => {
    const [periodo, setPeriodo] = useState<PeriodoMonitoramento>(15)
    const [filtros, setFiltros] = useState<FiltrosHome>(FILTROS_HOME_INICIAIS)
    const dashboard = useObterDashboard({ periodo })
    const projetos = dashboard.data?.projetos ?? []
    const projetosFiltrados = useMemo(() => filtrarProjetos(projetos, filtros), [projetos, filtros])

    const alterarFiltro = <C extends keyof FiltrosHome>(campo: C, valor: FiltrosHome[C]) => {
        setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
    }

    return {
        periodo,
        filtros,
        projetosFiltrados,
        metricas: dashboard.data?.metricas,
        totalProjetos: projetos.length,
        isLoading: dashboard.isLoading,
        isError: dashboard.isError,
        isFetching: dashboard.isFetching,
        setPeriodo,
        alterarFiltro,
        tentarNovamente: dashboard.refetch,
    }
}
