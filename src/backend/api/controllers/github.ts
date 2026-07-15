import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Enum } from "@/backend/api/enums/enum"
import {
    obterConexoesGitHub,
    obterRepositoriosGitHub,
    removerConexaoGitHub,
    salvarConexaoGitHub,
    testarConexaoGitHub,
} from "@/backend/api/integrations/github"
import type {
    ObterRepositoriosGitHub,
    RemoverConexaoGitHub,
    SalvarConexaoGitHub,
    TestarConexaoGitHub,
} from "@/backend/api/models/github.types"
import { TEMPO_CACHE_REPOSITORIOS_GITHUB } from "@/lib/config/monitoring"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { queryClient } from "@/lib/config/query-client"

export const useObterConexoesGitHub = () => {
    return useQuery({
        queryKey: [Enum.GitHubQueryKey.Conexoes],
        queryFn: obterConexoesGitHub,
        enabled: possuiRuntimeTauri(),
        retry: (failureCount, error) => {
            const code =
                typeof error === "object" && error !== null && "code" in error
                    ? error.code
                    : undefined
            return failureCount < 1 && ![
                "GITHUB_TOKEN_INVALIDO",
                "GITHUB_TOKEN_EXPIRADO",
                "GITHUB_SEM_PERMISSAO",
                "GITHUB_RATE_LIMIT",
            ].includes(String(code))
        },
    })
}

export const useSalvarConexaoGitHub = () => {
    return useMutation({
        mutationFn: (request: SalvarConexaoGitHub.Request) => salvarConexaoGitHub(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Conexoes] })
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Repositorios] })
        },
    })
}

export const useTestarConexaoGitHub = () => {
    return useMutation({
        mutationFn: (request: TestarConexaoGitHub.Request) => testarConexaoGitHub(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Conexoes] })
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Repositorios] })
        },
    })
}

export const useRemoverConexaoGitHub = () => {
    return useMutation({
        mutationFn: (request: RemoverConexaoGitHub.Request) => removerConexaoGitHub(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Conexoes] })
            await queryClient.invalidateQueries({ queryKey: [Enum.GitHubQueryKey.Repositorios] })
        },
    })
}

export const useObterRepositoriosGitHub = (
    request: ObterRepositoriosGitHub.Request = {},
    enabled = true
) => {
    return useQuery({
        queryKey: [Enum.GitHubQueryKey.Repositorios, request.connectionIds ?? []],
        queryFn: () => obterRepositoriosGitHub(request),
        enabled: enabled && possuiRuntimeTauri(),
        staleTime: TEMPO_CACHE_REPOSITORIOS_GITHUB,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
            const code =
                typeof error === "object" && error !== null && "code" in error
                    ? error.code
                    : undefined
            return failureCount < 1 && ![
                "GITHUB_TOKEN_INVALIDO",
                "GITHUB_TOKEN_EXPIRADO",
                "GITHUB_SEM_PERMISSAO",
                "GITHUB_RATE_LIMIT",
            ].includes(String(code))
        },
    })
}
