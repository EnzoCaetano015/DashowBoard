import { useMutation, useQuery } from "@tanstack/react-query"

import {
    obterConexaoSupabase,
    obterProjetosSupabase,
    removerConexaoSupabase,
    salvarConexaoSupabase,
    testarConexaoSupabase,
} from "@/backend/api/integrations/supabase"
import { SupabaseQueryKeys, type SalvarConexaoSupabase } from "@/backend/api/models/supabase.types"
import { INTERVALO_ATUALIZACAO_SUPABASE } from "@/lib/config/monitoring"
import { queryClient } from "@/lib/config/query-client"
import { deveTentarNovamenteSupabase } from "@/lib/utils/supabase"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

const invalidarSupabase = async () => {
    await queryClient.invalidateQueries({ queryKey: [SupabaseQueryKeys.Conexao] })
    await queryClient.invalidateQueries({ queryKey: [SupabaseQueryKeys.Projetos] })
}

export const useObterConexaoSupabase = () => {
    return useQuery({
        queryKey: [SupabaseQueryKeys.Conexao],
        queryFn: obterConexaoSupabase,
        enabled: possuiRuntimeTauri(),
        retry: deveTentarNovamenteSupabase,
    })
}

export const useSalvarConexaoSupabase = () => {
    return useMutation({
        mutationFn: (request: SalvarConexaoSupabase.Request) => salvarConexaoSupabase(request),
        onSuccess: invalidarSupabase,
    })
}

export const useTestarConexaoSupabase = () => {
    return useMutation({
        mutationFn: testarConexaoSupabase,
        onSuccess: invalidarSupabase,
    })
}

export const useRemoverConexaoSupabase = () => {
    return useMutation({
        mutationFn: removerConexaoSupabase,
        onSuccess: invalidarSupabase,
    })
}

export const useObterProjetosSupabase = (enabled = true) => {
    return useQuery({
        queryKey: [SupabaseQueryKeys.Projetos],
        queryFn: async () => {
            const response = await obterProjetosSupabase()
            await queryClient.invalidateQueries({ queryKey: [SupabaseQueryKeys.Conexao] })
            return response
        },
        enabled: enabled && possuiRuntimeTauri(),
        staleTime: 1000 * 30,
        refetchInterval: INTERVALO_ATUALIZACAO_SUPABASE,
        refetchIntervalInBackground: true,
        refetchOnReconnect: true,
        retry: deveTentarNovamenteSupabase,
    })
}
