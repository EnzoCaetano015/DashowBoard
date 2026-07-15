import { useMutation, useQuery } from "@tanstack/react-query"

import {
    obterConexaoVercel,
    obterProjetosVercel,
    removerConexaoVercel,
    salvarConexaoVercel,
    testarConexaoVercel,
} from "@/backend/api/integrations/vercel"
import {
    VercelQueryKeys,
    type SalvarConexaoVercel,
} from "@/backend/api/models/vercel.types"
import { TEMPO_CACHE_PROJETOS_VERCEL } from "@/lib/config/monitoring"
import { queryClient } from "@/lib/config/query-client"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { deveTentarNovamenteVercel } from "@/lib/utils/vercel"

export const useObterConexaoVercel = () => {
    return useQuery({
        queryKey: [VercelQueryKeys.Conexao],
        queryFn: obterConexaoVercel,
        enabled: possuiRuntimeTauri(),
        retry: deveTentarNovamenteVercel,
    })
}

export const useSalvarConexaoVercel = () => {
    return useMutation({
        mutationFn: (request: SalvarConexaoVercel.Request) => salvarConexaoVercel(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Conexao] })
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Projetos] })
        },
    })
}

export const useTestarConexaoVercel = () => {
    return useMutation({
        mutationFn: testarConexaoVercel,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Conexao] })
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Projetos] })
        },
    })
}

export const useRemoverConexaoVercel = () => {
    return useMutation({
        mutationFn: removerConexaoVercel,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Conexao] })
            await queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Projetos] })
        },
    })
}

export const useObterProjetosVercel = (enabled = true) => {
    return useQuery({
        queryKey: [VercelQueryKeys.Projetos],
        queryFn: obterProjetosVercel,
        enabled: enabled && possuiRuntimeTauri(),
        staleTime: TEMPO_CACHE_PROJETOS_VERCEL,
        refetchOnReconnect: true,
        retry: deveTentarNovamenteVercel,
    })
}
