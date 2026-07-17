import { useMutation, useQuery } from "@tanstack/react-query"

import {
    obterConexaoRailway,
    obterProjetosRailway,
    removerConexaoRailway,
    salvarConexaoRailway,
    testarConexaoRailway,
} from "@/backend/api/integrations/railway"
import { RailwayQueryKeys, type SalvarConexaoRailway } from "@/backend/api/models/railway.types"
import { INTERVALO_ATUALIZACAO_RAILWAY, TEMPO_CACHE_PROJETOS_RAILWAY } from "@/lib/config/monitoring"
import { queryClient } from "@/lib/config/query-client"
import { deveTentarNovamenteRailway } from "@/lib/utils/railway"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

const invalidarRailway = async () => {
    await queryClient.invalidateQueries({ queryKey: [RailwayQueryKeys.Conexao] })
    await queryClient.invalidateQueries({ queryKey: [RailwayQueryKeys.Projetos] })
}

export const useObterConexaoRailway = () => {
    return useQuery({
        queryKey: [RailwayQueryKeys.Conexao],
        queryFn: obterConexaoRailway,
        enabled: possuiRuntimeTauri(),
        retry: deveTentarNovamenteRailway,
    })
}

export const useSalvarConexaoRailway = () => {
    return useMutation({
        mutationFn: (request: SalvarConexaoRailway.Request) => salvarConexaoRailway(request),
        onSuccess: invalidarRailway,
    })
}

export const useTestarConexaoRailway = () => {
    return useMutation({
        mutationFn: testarConexaoRailway,
        onSuccess: invalidarRailway,
    })
}

export const useRemoverConexaoRailway = () => {
    return useMutation({
        mutationFn: removerConexaoRailway,
        onSuccess: invalidarRailway,
    })
}

export const useObterProjetosRailway = (enabled = true) => {
    return useQuery({
        queryKey: [RailwayQueryKeys.Projetos],
        queryFn: async () => {
            const response = await obterProjetosRailway()
            await queryClient.invalidateQueries({ queryKey: [RailwayQueryKeys.Conexao] })
            return response
        },
        enabled: enabled && possuiRuntimeTauri(),
        staleTime: TEMPO_CACHE_PROJETOS_RAILWAY,
        refetchInterval: INTERVALO_ATUALIZACAO_RAILWAY,
        refetchIntervalInBackground: true,
        refetchOnReconnect: true,
        retry: deveTentarNovamenteRailway,
    })
}
