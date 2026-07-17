import { useQuery } from "@tanstack/react-query"

import { IncidenteQueryKeys } from "@/backend/api/models/incidente.types"
import { listarIncidentes } from "@/backend/sql/repositories/incidente"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useObterIncidentes = () => {
    return useQuery({
        queryKey: [IncidenteQueryKeys.ObterIncidentes],
        queryFn: listarIncidentes,
        enabled: possuiRuntimeTauri(),
        staleTime: 30_000,
    })
}
