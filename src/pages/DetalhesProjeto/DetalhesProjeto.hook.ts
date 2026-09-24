import { useIsFetching } from "@tanstack/react-query"
import { useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { useObterProjetoPorId } from "@/backend/api/controllers/projeto"
import { Enum } from "@/backend/api/enums/enum"
import { GitHubQueryKeys } from "@/backend/api/models/github.types"
import { HealthCheckQueryKeys } from "@/backend/api/models/health-check.types"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { RailwayQueryKeys } from "@/backend/api/models/railway.types"
import { SupabaseQueryKeys } from "@/backend/api/models/supabase.types"
import { VercelQueryKeys } from "@/backend/api/models/vercel.types"
import { queryClient } from "@/lib/config/query-client"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import {
    ABAS_DETALHES_PROJETO,
    type AbaDetalhesProjeto,
} from "@/pages/DetalhesProjeto/DetalhesProjeto.types"

export const useDetalhesProjeto = () => {
    const { modal, setModal } = useControlModal(["editarProjeto", "excluirProjeto"] as const)
    const { id } = useParams<{ id: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const abaParam = searchParams.get("aba")
    const aba: AbaDetalhesProjeto = ABAS_DETALHES_PROJETO.includes(abaParam as AbaDetalhesProjeto)
        ? (abaParam as AbaDetalhesProjeto)
        : "visao-geral"

    const {
        data: projeto,
        isLoading: projetoIsLoading,
        isFetching: projetoIsFetching,
        isError: projetoIsError,
        refetch: atualizarProjeto,
    } = useObterProjetoPorId({ id })
    const vercelIsFetching = useIsFetching({ queryKey: [VercelQueryKeys.Projetos] }) > 0
    const supabaseIsFetching = useIsFetching({ queryKey: [SupabaseQueryKeys.Projetos] }) > 0
    const railwayIsFetching = useIsFetching({ queryKey: [RailwayQueryKeys.Projetos] }) > 0

    const atualizar = () => {
        const providers = new Set(projeto?.providers ?? [])
        const atualizacao = Promise.all([
            ...(projeto?.repositorios.length
                ? [queryClient.invalidateQueries({ queryKey: [GitHubQueryKeys.Repositorios] })]
                : []),
            ...(providers.has(Enum.Provider.Vercel)
                ? [queryClient.invalidateQueries({ queryKey: [VercelQueryKeys.Projetos] })]
                : []),
            ...(providers.has(Enum.Provider.Supabase)
                ? [queryClient.invalidateQueries({ queryKey: [SupabaseQueryKeys.Projetos] })]
                : []),
            ...(providers.has(Enum.Provider.Railway)
                ? [queryClient.invalidateQueries({ queryKey: [RailwayQueryKeys.Projetos] })]
                : []),
            ...(projeto?.urlAplicacao
                ? [
                      queryClient.invalidateQueries({
                          queryKey: [HealthCheckQueryKeys.VerificarProjeto, projeto.id],
                      }),
                  ]
                : []),
        ]).then(() => atualizarProjeto({ throwOnError: true }))

        toast.promise(atualizacao, {
            id: `atualizar-projeto-${id}`,
            loading: "Atualizando projeto...",
            success: "Recursos associados atualizados.",
            error: "Não foi possível atualizar o projeto.",
        })
    }

    const atualizarServico = (servico: ObterProjetos.Servico) => {
        const queryKey =
            servico.provider === Enum.Provider.Vercel
                ? VercelQueryKeys.Projetos
                : servico.provider === Enum.Provider.Supabase
                  ? SupabaseQueryKeys.Projetos
                  : RailwayQueryKeys.Projetos
        const atualizacao = queryClient.refetchQueries(
            { queryKey: [queryKey], type: "active" },
            { throwOnError: true }
        )
        toast.promise(atualizacao, {
            id: `atualizar-provider-${servico.provider}`,
            loading: `Atualizando ${servico.nome}...`,
            success: `Dados de ${servico.nome} atualizados.`,
            error: `Não foi possível atualizar ${servico.nome}.`,
        })
    }

    const servicoAtualizando = (provider: Enum.Provider) => {
        if (provider === Enum.Provider.Vercel) return vercelIsFetching
        if (provider === Enum.Provider.Supabase) return supabaseIsFetching
        if (provider === Enum.Provider.Railway) return railwayIsFetching
        return false
    }

    const alterarAba = (valor: string) => {
        if (!ABAS_DETALHES_PROJETO.includes(valor as AbaDetalhesProjeto)) return
        const parametros = new URLSearchParams(searchParams)
        if (valor === "visao-geral") parametros.delete("aba")
        else parametros.set("aba", valor)
        setSearchParams(parametros, { replace: true })
    }

    return {
        modal,
        setModal,
        projeto,
        aba,
        alterarAba,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: projetoIsLoading,
        isFetching: projetoIsFetching,
        isError: projetoIsError,
        atualizar,
        atualizarServico,
        servicoAtualizando,
    }
}
