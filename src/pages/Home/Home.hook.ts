import { useMemo, useState } from "react"

import { useObterDashboard } from "@/backend/api/controllers/projeto"
import { PERIODO_DASHBOARD } from "@/lib/config/monitoring"
import type { FiltrosHome } from "@/pages/Home/Home.types"
import { FILTROS_HOME_INICIAIS, filtrarProjetos } from "@/pages/Home/Home.utils"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useHome = () => {
    const { modal, setModal } = useControlModal(["novoProjeto"] as const)
    const [filtros, setFiltros] = useState<FiltrosHome>(FILTROS_HOME_INICIAIS)

    const {
        data: dashboard,
        isLoading: dashboardIsLoading,
        isFetching: dashboardIsFetching,
        isError: dashboardIsError,
        refetch: atualizarDashboard,
    } = useObterDashboard({ periodo: PERIODO_DASHBOARD })

    const projetos = dashboard?.projetos ?? []
    const projetosFiltrados = useMemo(() => filtrarProjetos(projetos, filtros), [projetos, filtros])

    const alterarFiltro = <C extends keyof FiltrosHome>(campo: C, valor: FiltrosHome[C]) => {
        setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
    }

    return {
        modal,
        setModal,
        filtros,
        projetosFiltrados,
        metricas: dashboard?.metricas,
        totalProjetos: projetos.length,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: dashboardIsLoading,
        isFetching: dashboardIsFetching,
        isError: dashboardIsError,
        atualizar: atualizarDashboard,
        alterarFiltro,
    }
}
