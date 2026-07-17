import { useIsFetching } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { DashboardQueryKeys } from "@/backend/api/models/dashboard.types"
import { GitHubQueryKeys } from "@/backend/api/models/github.types"
import { IncidenteQueryKeys } from "@/backend/api/models/incidente.types"
import { ProjetoQueryKeys } from "@/backend/api/models/projeto.types"
import { RailwayQueryKeys } from "@/backend/api/models/railway.types"
import { SupabaseQueryKeys } from "@/backend/api/models/supabase.types"
import { VercelQueryKeys } from "@/backend/api/models/vercel.types"
import { queryClient } from "@/lib/config/query-client"
import { useIntegracoes } from "@/lib/hooks/useIntegracoes"
import { formatarAgora } from "@/lib/utils/date"

const CHAVES_ATUALIZAVEIS = new Set<unknown>([
    DashboardQueryKeys.ObterDashboard,
    GitHubQueryKeys.Conexoes,
    GitHubQueryKeys.Repositorios,
    IncidenteQueryKeys.ObterIncidentes,
    ProjetoQueryKeys.ObterProjetoPorId,
    ProjetoQueryKeys.ObterProjetos,
    RailwayQueryKeys.Conexao,
    RailwayQueryKeys.Projetos,
    SupabaseQueryKeys.Conexao,
    SupabaseQueryKeys.Projetos,
    VercelQueryKeys.Conexao,
    VercelQueryKeys.Projetos,
])

export const useTopBar = () => {
    const [busca, setBusca] = useState("")
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() => formatarAgora())
    const consultasAtivas = useIsFetching()
    const integracoes = useIntegracoes()

    const atualizarTudo = () => {
        const atualizacao = queryClient
            .invalidateQueries({
                predicate: ({ queryKey }) => CHAVES_ATUALIZAVEIS.has(queryKey[0]),
            })
            .then(() => setUltimaAtualizacao(formatarAgora()))

        toast.promise(atualizacao, {
            id: "atualizar-todos-os-dados",
            loading: "Atualizando dados...",
            success: "Dados atualizados.",
            error: "Não foi possível atualizar todos os dados.",
        })
    }

    return {
        busca,
        setBusca,
        ultimaAtualizacao,
        consultasAtivas,
        integracoes,
        atualizarTudo,
    }
}
