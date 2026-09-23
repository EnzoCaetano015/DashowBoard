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
import { obterMensagemErro } from "@/lib/utils/error"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useIntegracoes = () => {
    const {
        data: conexoesGitHub = [],
        isLoading: githubIsLoading,
        isError: githubIsError,
        error: githubError,
        refetch: atualizarGitHub,
    } = useObterConexoesGitHub()
    const {
        data: conexaoVercel,
        isLoading: vercelIsLoading,
        isError: vercelIsError,
        error: vercelError,
        refetch: atualizarVercel,
    } = useObterConexaoVercel()
    const {
        data: conexaoSupabase,
        isLoading: supabaseIsLoading,
        isError: supabaseIsError,
        error: supabaseError,
        refetch: atualizarSupabase,
    } = useObterConexaoSupabase()
    const {
        data: projetosSupabase,
        error: projetosSupabaseError,
        refetch: atualizarProjetosSupabase,
    } = useObterProjetosSupabase(Boolean(conexaoSupabase))
    const {
        data: conexaoRailway,
        isLoading: railwayIsLoading,
        isError: railwayIsError,
        error: railwayError,
        refetch: atualizarRailway,
    } = useObterConexaoRailway()
    const runtimeDisponivel = possuiRuntimeTauri()

    const integracoes = useMemo(
        () => [
            montarIntegracaoGitHub(conexoesGitHub, {
                runtimeDisponivel,
                isLoading: githubIsLoading,
                erro: githubError
                    ? obterMensagemErro(githubError, "Falha ao consultar o GitHub.")
                    : undefined,
            }),
            montarIntegracaoVercel(conexaoVercel ?? null, {
                runtimeDisponivel,
                isLoading: vercelIsLoading,
                erro: vercelError
                    ? obterMensagemErro(vercelError, "Falha ao consultar a Vercel.")
                    : undefined,
            }),
            montarIntegracaoSupabase(conexaoSupabase ?? null, projetosSupabase, {
                runtimeDisponivel,
                isLoading: supabaseIsLoading,
                erro:
                    supabaseError || projetosSupabaseError
                        ? obterMensagemErro(
                              supabaseError ?? projetosSupabaseError,
                              "Falha ao consultar o Supabase."
                          )
                        : undefined,
            }),
            montarIntegracaoRailway(conexaoRailway ?? null, {
                runtimeDisponivel,
                isLoading: railwayIsLoading,
                erro: railwayError
                    ? obterMensagemErro(railwayError, "Falha ao consultar a Railway.")
                    : undefined,
            }),
        ],
        [
            conexaoRailway,
            conexaoSupabase,
            conexaoVercel,
            conexoesGitHub,
            githubError,
            githubIsLoading,
            projetosSupabaseError,
            projetosSupabase,
            railwayError,
            railwayIsLoading,
            runtimeDisponivel,
            supabaseError,
            supabaseIsLoading,
            vercelError,
            vercelIsLoading,
        ]
    )

    const todasConexoesFalharam =
        githubIsError && vercelIsError && supabaseIsError && railwayIsError
    const error = githubError ?? vercelError ?? supabaseError ?? railwayError

    return {
        integracoes,
        isLoading: githubIsLoading || vercelIsLoading || supabaseIsLoading || railwayIsLoading,
        isError: todasConexoesFalharam,
        error: todasConexoesFalharam && error
            ? obterMensagemErro(error, "Não foi possível consultar as integrações configuradas.")
            : undefined,
        atualizar: () =>
            Promise.all([
                atualizarGitHub(),
                atualizarVercel(),
                atualizarSupabase(),
                atualizarProjetosSupabase(),
                atualizarRailway(),
            ]),
    }
}
