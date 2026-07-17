import { useMemo, useState } from "react"

import { useObterIncidentes } from "@/backend/api/controllers/incidente"
import { Enum } from "@/backend/api/enums/enum"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useIncidentes = () => {
    const [periodo, setPeriodo] = useState<PeriodoMonitoramento>(15)
    const [busca, setBusca] = useState("")

    const {
        data: incidentes = [],
        isLoading: incidentesIsLoading,
        isError: incidentesIsError,
        refetch: atualizarIncidentes,
    } = useObterIncidentes()

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR")
        const limite = Date.now() - periodo * 24 * 60 * 60 * 1000
        return incidentes.filter((incidente) => {
            const noPeriodo = new Date(incidente.iniciadoEm).getTime() >= limite
            if (!noPeriodo) return false
            return (
                !termo ||
                `${incidente.titulo} ${incidente.projetoNome} ${incidente.servico}`
                    .toLocaleLowerCase("pt-BR")
                    .includes(termo)
            )
        })
    }, [busca, incidentes, periodo])

    return {
        periodo,
        busca,
        incidentes: filtrados,
        emAndamento: filtrados.filter((incidente) => incidente.status !== Enum.StatusIncidente.Resolvido)
            .length,
        resolvidos: filtrados.filter((incidente) => incidente.status === Enum.StatusIncidente.Resolvido)
            .length,
        projetosMonitorados: new Set(filtrados.map((incidente) => incidente.projetoId)).size,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: incidentesIsLoading,
        isError: incidentesIsError,
        atualizar: atualizarIncidentes,
        setPeriodo,
        setBusca,
    }
}
