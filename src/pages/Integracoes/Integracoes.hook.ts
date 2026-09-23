import { toast } from "sonner"

import {
    useObterConexoesGitHub,
    useTestarConexaoGitHub,
} from "@/backend/api/controllers/github"
import { useObterConexaoRailway, useTestarConexaoRailway } from "@/backend/api/controllers/railway"
import { useObterConexaoSupabase, useTestarConexaoSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel, useTestarConexaoVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { useIntegracoes as useIntegracoesDisponiveis } from "@/lib/hooks/useIntegracoes"
import { obterMensagemErro } from "@/lib/utils/error"
import { labelProvider } from "@/lib/utils/status"

export const useIntegracoes = () => {
    const { modal, setModal } = useControlModal([
        "integracaoGitHub",
        "integracaoVercel",
        "integracaoSupabase",
        "integracaoRailway",
    ] as const)
    const { integracoes, isLoading, isError, error, atualizar } = useIntegracoesDisponiveis()
    const { data: conexoesGitHub = [], refetch: atualizarConexoesGitHub } = useObterConexoesGitHub()
    const { data: conexaoVercel } = useObterConexaoVercel()
    const { data: conexaoSupabase } = useObterConexaoSupabase()
    const { data: conexaoRailway } = useObterConexaoRailway()
    const { mutateAsync: testarGitHub, isPending: githubIsTesting } = useTestarConexaoGitHub()
    const { mutateAsync: testarVercel, isPending: vercelIsTesting } = useTestarConexaoVercel()
    const { mutateAsync: testarSupabase, isPending: supabaseIsTesting } = useTestarConexaoSupabase()
    const { mutateAsync: testarRailway, isPending: railwayIsTesting } = useTestarConexaoRailway()

    const abrirDialogo = (provider: Enum.Provider) => {
        if (provider === Enum.Provider.GitHub) {
            setModal("integracaoGitHub", { open: true })
        }
        if (provider === Enum.Provider.Vercel) {
            setModal("integracaoVercel", { open: true })
        }
        if (provider === Enum.Provider.Supabase) {
            setModal("integracaoSupabase", { open: true })
        }
        if (provider === Enum.Provider.Railway) {
            setModal("integracaoRailway", { open: true })
        }
    }

    const testarIntegracao = (provider: Enum.Provider) => {
        let teste: Promise<unknown>

        if (provider === Enum.Provider.GitHub) {
            teste = Promise.allSettled(
                conexoesGitHub.map(({ id }) => testarGitHub({ connectionId: id }))
            ).then(async (resultados) => {
                await atualizarConexoesGitHub()
                const falhas = resultados.filter(({ status }) => status === "rejected").length
                if (falhas > 0) {
                    throw new Error(
                        `${falhas} de ${resultados.length} conexões do GitHub falharam no teste.`
                    )
                }
            })
        } else if (provider === Enum.Provider.Vercel) teste = testarVercel()
        else if (provider === Enum.Provider.Supabase) teste = testarSupabase()
        else teste = testarRailway()

        toast.promise(teste, {
            id: `testar-integracao-${provider}`,
            loading: `Testando ${labelProvider[provider]}...`,
            success: `Conexão ${labelProvider[provider]} validada.`,
            error: (erro) => obterMensagemErro(erro, `Falha ao testar ${labelProvider[provider]}.`),
        })
    }

    const podeTestar = (provider: Enum.Provider) => {
        if (provider === Enum.Provider.GitHub) return conexoesGitHub.length > 0
        if (provider === Enum.Provider.Vercel) return Boolean(conexaoVercel)
        if (provider === Enum.Provider.Supabase) return Boolean(conexaoSupabase)
        return Boolean(conexaoRailway)
    }

    const integracaoIsTesting = (provider: Enum.Provider) => {
        if (provider === Enum.Provider.GitHub) return githubIsTesting
        if (provider === Enum.Provider.Vercel) return vercelIsTesting
        if (provider === Enum.Provider.Supabase) return supabaseIsTesting
        return railwayIsTesting
    }

    return {
        modal,
        setModal,
        integracoes,
        isLoading,
        isError,
        error,
        atualizar,
        abrirDialogo,
        testarIntegracao,
        podeTestar,
        integracaoIsTesting,
    }
}
