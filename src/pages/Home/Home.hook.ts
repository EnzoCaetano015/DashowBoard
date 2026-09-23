import { useMemo, useState } from "react"

import { useObterDashboard } from "@/backend/api/controllers/projeto"
import { PERIODO_DASHBOARD } from "@/lib/config/monitoring"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import type { FiltrosHome } from "@/pages/Home/Home.types"
import {
    contarFiltrosHomeAtivos,
    FILTROS_HOME_INICIAIS,
    filtrarProjetos,
    ordenarProjetos,
} from "@/pages/Home/Home.utils"

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
    const projetosFiltrados = useMemo(
        () => ordenarProjetos(filtrarProjetos(projetos, filtros), filtros.ordenacao),
        [projetos, filtros]
    )

    const alterarFiltro = <C extends keyof FiltrosHome>(campo: C, valor: FiltrosHome[C]) => {
        setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
    }

    return {
        modal,
        setModal,
        filtros,
        projetosFiltrados,
        quantidadeFiltrosAtivos: contarFiltrosHomeAtivos(filtros),
        metricas: dashboard?.metricas,
        totalProjetos: projetos.length,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: dashboardIsLoading,
        isFetching: dashboardIsFetching,
        isError: dashboardIsError,
        atualizar: atualizarDashboard,
        alterarFiltro,
        limparFiltros: () => setFiltros(FILTROS_HOME_INICIAIS),
    }
}
