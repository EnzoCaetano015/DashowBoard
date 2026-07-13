import { useMemo, useState } from "react"

import { useObterIncidentes } from "@/backend/api/controllers/incidente"
import { Enum } from "@/backend/api/enums/enum"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"

export const useIncidentes = () => {
    const [periodo, setPeriodo] = useState<PeriodoMonitoramento>(15)
    const [busca, setBusca] = useState("")
    const consulta = useObterIncidentes()
    const incidentes = consulta.data ?? []
    const filtrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR")
        return termo
            ? incidentes.filter((incidente) =>
                  `${incidente.titulo} ${incidente.projetoNome} ${incidente.servico}`
                      .toLocaleLowerCase("pt-BR")
                      .includes(termo)
              )
            : incidentes
    }, [busca, incidentes])

    return {
        periodo,
        busca,
        incidentes: filtrados,
        emAndamento: filtrados.filter((incidente) => incidente.status !== Enum.StatusIncidente.Resolvido)
            .length,
        resolvidos: filtrados.filter((incidente) => incidente.status === Enum.StatusIncidente.Resolvido)
            .length,
        projetosMonitorados: new Set(incidentes.map((incidente) => incidente.projetoId)).size,
        isLoading: consulta.isLoading,
        isError: consulta.isError,
        setPeriodo,
        setBusca,
        tentarNovamente: consulta.refetch,
    }
}
