import { useMemo } from "react"

import { useObterConexoesGitHub } from "@/backend/api/controllers/github"
import { useObterConexaoRailway } from "@/backend/api/controllers/railway"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel } from "@/backend/api/controllers/vercel"
import {
    montarIntegracaoGitHub,
    montarIntegracaoRailway,
    montarIntegracaoSupabase,
    montarIntegracaoVercel,
} from "@/lib/utils/integracoes"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useIntegracoes = () => {
    const { data: conexoesGitHub = [], isLoading: githubIsLoading } = useObterConexoesGitHub()
    const { data: conexaoVercel, isLoading: vercelIsLoading } = useObterConexaoVercel()
    const { data: conexaoSupabase, isLoading: supabaseIsLoading } = useObterConexaoSupabase()
    const { data: projetosSupabase } = useObterProjetosSupabase(Boolean(conexaoSupabase))
    const { data: conexaoRailway, isLoading: railwayIsLoading } = useObterConexaoRailway()
    const runtimeDisponivel = possuiRuntimeTauri()

    return useMemo(
        () => [
            montarIntegracaoGitHub(conexoesGitHub, {
                runtimeDisponivel,
                isLoading: githubIsLoading,
            }),
            montarIntegracaoVercel(conexaoVercel ?? null, {
                runtimeDisponivel,
                isLoading: vercelIsLoading,
            }),
            montarIntegracaoSupabase(conexaoSupabase ?? null, projetosSupabase, {
                runtimeDisponivel,
                isLoading: supabaseIsLoading,
            }),
            montarIntegracaoRailway(conexaoRailway ?? null, {
                runtimeDisponivel,
                isLoading: railwayIsLoading,
            }),
        ],
        [
            conexaoRailway,
            conexaoSupabase,
            conexaoVercel,
            conexoesGitHub,
            githubIsLoading,
            projetosSupabase,
            railwayIsLoading,
            runtimeDisponivel,
            supabaseIsLoading,
            vercelIsLoading,
        ]
    )
}
