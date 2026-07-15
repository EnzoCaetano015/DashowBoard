import { useQuery } from "@tanstack/react-query"

import {
    obterDashboardMock,
    obterProjetoPorIdMock,
    obterProjetosMock,
} from "@/backend/api/integrations/mock"
import { DashboardQueryKeys, type ObterDashboard } from "@/backend/api/models/dashboard.types"
import { ProjetoQueryKeys, type ObterProjetoPorId } from "@/backend/api/models/projeto.types"

const TEMPO_CACHE_MOCK = 1000 * 60 * 5

export const useObterDashboard = (request: ObterDashboard.Request) => {
    return useQuery({
        queryKey: [DashboardQueryKeys.ObterDashboard, request],
        queryFn: () => obterDashboardMock(request),
        staleTime: TEMPO_CACHE_MOCK,
    })
}

export const useObterProjetos = () => {
    return useQuery({
        queryKey: [ProjetoQueryKeys.ObterProjetos],
        queryFn: obterProjetosMock,
        staleTime: TEMPO_CACHE_MOCK,
    })
}

export const useObterProjetoPorId = (request: ObterProjetoPorId.Request) => {
    return useQuery({
        queryKey: [ProjetoQueryKeys.ObterProjetoPorId, request],
        queryFn: () => obterProjetoPorIdMock(request),
        enabled: Boolean(request.id),
        staleTime: TEMPO_CACHE_MOCK,
    })
}
