import { useMemo, useState } from "react"

import { useObterConexoesGitHub } from "@/backend/api/controllers/github"
import { useObterIntegracoes } from "@/backend/api/controllers/integracao"
import { useObterConexaoVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"
import { formatarDataHora } from "@/lib/utils/date"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarErroVercel } from "@/lib/utils/vercel"

export const useIntegracoes = () => {
    const [githubDialogOpen, setGitHubDialogOpen] = useState(false)
    const [vercelDialogOpen, setVercelDialogOpen] = useState(false)
    const integrationsQuery = useObterIntegracoes()
    const connectionsQuery = useObterConexoesGitHub()
    const vercelConnectionQuery = useObterConexaoVercel()
    const runtimeDisponivel = possuiRuntimeTauri()

    const githubIntegration = useMemo<ObterIntegracoes.Integracao>(() => {
        const connections = connectionsQuery.data ?? []
        const validConnections = connections.filter(
            (connection) => connection.status === Enum.StatusIntegracao.Conectado
        )
        const failedConnections = connections.filter(
            (connection) => connection.status === Enum.StatusIntegracao.Erro
        )
        const latestSync = [...connections]
            .sort((left, right) => right.ultimaSincronizacao.localeCompare(left.ultimaSincronizacao))[0]
            ?.ultimaSincronizacao

        if (!runtimeDisponivel) {
            return {
                provider: Enum.Provider.GitHub,
                conta: "Disponível no aplicativo desktop",
                status: Enum.StatusIntegracao.Desconectado,
                ultimaSincronizacao: "Não disponível",
            }
        }

        return {
            provider: Enum.Provider.GitHub,
            conta:
                connections.length === 0
                    ? "Nenhuma conexão configurada"
                    : `${connections.length} conex${connections.length === 1 ? "ão" : "ões"} · ${validConnections.length} válida${validConnections.length === 1 ? "" : "s"}`,
            status:
                failedConnections.length > 0
                    ? Enum.StatusIntegracao.Erro
                    : validConnections.length > 0
                      ? Enum.StatusIntegracao.Conectado
                      : Enum.StatusIntegracao.Desconectado,
            erro:
                failedConnections.length > 0
                    ? `${failedConnections.length} conexão(ões) precisa(m) de atenção. As demais continuam disponíveis.`
                    : undefined,
            ultimaSincronizacao: latestSync ? formatarDataHora(latestSync) : "Nunca",
        }
    }, [connectionsQuery.data, runtimeDisponivel])

    const vercelIntegration = useMemo<ObterIntegracoes.Integracao>(() => {
        if (!runtimeDisponivel) {
            return {
                provider: Enum.Provider.Vercel,
                conta: "Disponível no aplicativo desktop",
                status: Enum.StatusIntegracao.Desconectado,
                ultimaSincronizacao: "Não disponível",
            }
        }
        if (vercelConnectionQuery.isError) {
            return {
                provider: Enum.Provider.Vercel,
                conta: "Não foi possível consultar a conexão",
                status: Enum.StatusIntegracao.Erro,
                erro: normalizarErroVercel(vercelConnectionQuery.error).message,
                ultimaSincronizacao: "Não disponível",
            }
        }
        const connection = vercelConnectionQuery.data
        if (!connection) {
            return {
                provider: Enum.Provider.Vercel,
                conta: "Nenhuma conexão configurada",
                status: Enum.StatusIntegracao.Desconectado,
                ultimaSincronizacao: "Nunca",
            }
        }
        return {
            provider: Enum.Provider.Vercel,
            conta: `@${connection.username} · ${connection.quantidadeTimes} time(s) · ${connection.quantidadeProjetos} projeto(s)`,
            status: connection.status,
            erro: connection.erro ?? undefined,
            ultimaSincronizacao: formatarDataHora(connection.ultimaSincronizacao),
        }
    }, [runtimeDisponivel, vercelConnectionQuery.data, vercelConnectionQuery.error, vercelConnectionQuery.isError])

    return {
        integracoes: [githubIntegration, vercelIntegration, ...(integrationsQuery.data ?? [])],
        isLoading:
            integrationsQuery.isLoading ||
            (runtimeDisponivel && (connectionsQuery.isLoading || vercelConnectionQuery.isLoading)),
        isError: integrationsQuery.isError || (runtimeDisponivel && connectionsQuery.isError),
        githubDialogOpen,
        vercelDialogOpen,
        setGitHubDialogOpen,
        setVercelDialogOpen,
        tentarNovamente: async () => {
            await Promise.all([
                integrationsQuery.refetch(),
                connectionsQuery.refetch(),
                vercelConnectionQuery.refetch(),
            ])
        },
    }
}
