import { useMutation, useQuery } from "@tanstack/react-query"

import { useObterPreferencias } from "@/backend/api/controllers/preferencias"
import {
    obterConexaoRailway,
    obterProjetosRailway,
    removerConexaoRailway,
    salvarConexaoRailway,
    testarConexaoRailway,
} from "@/backend/api/integrations/railway"
import { RailwayQueryKeys, type SalvarConexaoRailway } from "@/backend/api/models/railway.types"
import { obterConfiguracaoMonitoramento, TEMPO_CACHE_PROJETOS_RAILWAY } from "@/lib/config/monitoring"
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
    const { data: preferencias } = useObterPreferencias()
    const { intervaloAtualizacao, verificacaoSegundoPlano } =
        obterConfiguracaoMonitoramento(preferencias)

    return useQuery({
        queryKey: [RailwayQueryKeys.Projetos],
        queryFn: async () => {
            const response = await obterProjetosRailway()
            await queryClient.invalidateQueries({ queryKey: [RailwayQueryKeys.Conexao] })
            return response
        },
        enabled: enabled && possuiRuntimeTauri(),
        staleTime: TEMPO_CACHE_PROJETOS_RAILWAY,
        refetchInterval: intervaloAtualizacao,
        refetchIntervalInBackground: verificacaoSegundoPlano,
        refetchOnReconnect: true,
        retry: deveTentarNovamenteRailway,
    })
}
