import { useMutation, useQuery } from "@tanstack/react-query"

import { DashboardQueryKeys, type ObterDashboard } from "@/backend/api/models/dashboard.types"
import { IncidenteQueryKeys } from "@/backend/api/models/incidente.types"
import {
    ProjetoQueryKeys,
    type AtualizarProjeto,
    type CriarProjeto,
    type ExcluirProjeto,
    type ObterProjetoPorId,
    type SalvarSnapshotServico,
} from "@/backend/api/models/projeto.types"
import {
    atualizarProjeto,
    criarProjeto,
    excluirProjeto,
    listarProjetos,
    obterDashboard,
    obterProjetoPorId,
    salvarSnapshotServico,
} from "@/backend/sql/repositories/projeto"
import { queryClient } from "@/lib/config/query-client"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

const invalidarProjetos = async () => {
    await queryClient.invalidateQueries({ queryKey: [ProjetoQueryKeys.ObterProjetos] })
    await queryClient.invalidateQueries({ queryKey: [ProjetoQueryKeys.ObterProjetoPorId] })
    await queryClient.invalidateQueries({ queryKey: [DashboardQueryKeys.ObterDashboard] })
}

export const useObterDashboard = (request: ObterDashboard.Request) => {
    return useQuery({
        queryKey: [DashboardQueryKeys.ObterDashboard, request],
        queryFn: () => obterDashboard(request.periodo),
        enabled: possuiRuntimeTauri(),
        staleTime: 30_000,
    })
}

export const useObterProjetos = () => {
    return useQuery({
        queryKey: [ProjetoQueryKeys.ObterProjetos],
        queryFn: listarProjetos,
        enabled: possuiRuntimeTauri(),
        staleTime: 30_000,
    })
}

export const useObterProjetoPorId = (request: ObterProjetoPorId.Request) => {
    return useQuery({
        queryKey: [ProjetoQueryKeys.ObterProjetoPorId, request.id],
        queryFn: () => obterProjetoPorId(request.id ?? ""),
        enabled: Boolean(request.id) && possuiRuntimeTauri(),
        staleTime: 30_000,
    })
}

export const useCriarProjeto = () => {
    return useMutation({
        mutationFn: (request: CriarProjeto.Request) => criarProjeto(request),
        onSuccess: invalidarProjetos,
    })
}

export const useAtualizarProjeto = () => {
    return useMutation({
        mutationFn: (request: AtualizarProjeto.Request) => atualizarProjeto(request),
        onSuccess: invalidarProjetos,
    })
}

export const useExcluirProjeto = () => {
    return useMutation({
        mutationFn: (request: ExcluirProjeto.Request) => excluirProjeto(request.id),
        onSuccess: async () => {
            await invalidarProjetos()
            await queryClient.invalidateQueries({ queryKey: [IncidenteQueryKeys.ObterIncidentes] })
        },
    })
}

export const useSalvarSnapshotServico = () => {
    return useMutation({
        mutationFn: (request: SalvarSnapshotServico.Request) => salvarSnapshotServico(request),
        onSuccess: async () => {
            await invalidarProjetos()
            await queryClient.invalidateQueries({ queryKey: [IncidenteQueryKeys.ObterIncidentes] })
        },
    })
}
