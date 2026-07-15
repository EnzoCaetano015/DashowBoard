import { useMemo, useState } from "react"

import { useObterConexoesGitHub } from "@/backend/api/controllers/github"
import { useObterIntegracoes } from "@/backend/api/controllers/integracao"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import {
    montarIntegracaoGitHub,
    montarIntegracaoSupabase,
    montarIntegracaoVercel,
} from "@/pages/Integracoes/Integracoes.utils"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useIntegracoes = () => {
    const [dialogoAtivo, setDialogoAtivo] = useState<Enum.Provider | null>(null)
    const integrationsQuery = useObterIntegracoes()
    const githubQuery = useObterConexoesGitHub()
    const vercelQuery = useObterConexaoVercel()
    const supabaseQuery = useObterConexaoSupabase()
    const supabaseProjectsQuery = useObterProjetosSupabase(Boolean(supabaseQuery.data))
    const runtimeDisponivel = possuiRuntimeTauri()

    const integracoes = useMemo(
        () => [
            montarIntegracaoGitHub(githubQuery.data ?? [], {
                runtimeDisponivel,
                isLoading: githubQuery.isLoading,
                isError: githubQuery.isError,
                error: githubQuery.error,
            }),
            montarIntegracaoVercel(vercelQuery.data ?? null, {
                runtimeDisponivel,
                isLoading: vercelQuery.isLoading,
                isError: vercelQuery.isError,
                error: vercelQuery.error,
            }),
            montarIntegracaoSupabase(
                supabaseQuery.data ?? null,
                supabaseProjectsQuery.data,
                {
                    runtimeDisponivel,
                    isLoading: supabaseQuery.isLoading,
                    isError: supabaseQuery.isError,
                    error: supabaseQuery.error,
                },
                {
                    isError: supabaseProjectsQuery.isError,
                    error: supabaseProjectsQuery.error,
                }
            ),
            ...(integrationsQuery.data ?? []),
        ],
        [
            githubQuery.data,
            githubQuery.error,
            githubQuery.isError,
            githubQuery.isLoading,
            integrationsQuery.data,
            runtimeDisponivel,
            supabaseProjectsQuery.data,
            supabaseProjectsQuery.error,
            supabaseProjectsQuery.isError,
            supabaseQuery.data,
            supabaseQuery.error,
            supabaseQuery.isError,
            supabaseQuery.isLoading,
            vercelQuery.data,
            vercelQuery.error,
            vercelQuery.isError,
            vercelQuery.isLoading,
        ]
    )

    return {
        integracoes,
        isLoading: integrationsQuery.isLoading,
        isError: integrationsQuery.isError,
        dialogoAtivo,
        abrirDialogo: (provider: Enum.Provider) => setDialogoAtivo(provider),
        fecharDialogo: () => setDialogoAtivo(null),
        tentarNovamente: integrationsQuery.refetch,
    }
}
