import { useQuery } from "@tanstack/react-query"

import { obterIncidentesMock } from "@/backend/api/integrations/mock"
import { IncidenteQueryKeys } from "@/backend/api/models/incidente.types"

export const useObterIncidentes = () => {
    return useQuery({
        queryKey: [IncidenteQueryKeys.ObterIncidentes],
        queryFn: obterIncidentesMock,
        staleTime: 1000 * 60 * 5,
    })
}
