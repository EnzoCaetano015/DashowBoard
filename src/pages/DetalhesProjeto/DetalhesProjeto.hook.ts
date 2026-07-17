import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { useObterProjetoPorId } from "@/backend/api/controllers/projeto"
import { Enum } from "@/backend/api/enums/enum"
import { GitHubQueryKeys } from "@/backend/api/models/github.types"
import { RailwayQueryKeys } from "@/backend/api/models/railway.types"
import { SupabaseQueryKeys } from "@/backend/api/models/supabase.types"
import { VercelQueryKeys } from "@/backend/api/models/vercel.types"
import { queryClient } from "@/lib/config/query-client"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useDetalhesProjeto = () => {
    const { modal, setModal } = useControlModal(["excluirProjeto"] as const)
    const { id } = useParams<{ id: string }>()

    const {
        data: projeto,
        isLoading: projetoIsLoading,
        isFetching: projetoIsFetching,
        isError: projetoIsError,
        refetch: atualizarProjeto,
    } = useObterProjetoPorId({ id })

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
        ]).then(() => atualizarProjeto({ throwOnError: true }))

        toast.promise(atualizacao, {
            id: `atualizar-projeto-${id}`,
            loading: "Atualizando projeto...",
            success: "Recursos associados atualizados.",
            error: "Não foi possível atualizar o projeto.",
        })
    }

    return {
        modal,
        setModal,
        projeto,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: projetoIsLoading,
        isFetching: projetoIsFetching,
        isError: projetoIsError,
        atualizar,
    }
}
