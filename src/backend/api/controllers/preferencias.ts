import { useMutation, useQuery } from "@tanstack/react-query"

import {
    type ExportarBackupBancoDados,
    type ObterInformacoesDesktop,
    PreferenciasQueryKeys,
    type RevelarBancoDados,
    type SalvarPreferencias,
} from "@/backend/api/models/preferencias.types"
import { exportarBackupBancoDados, revelarBancoDados } from "@/backend/sql/database"
import { obterPreferencias, salvarPreferencias } from "@/backend/sql/repositories/preferencias"
import {
    notificacoesDoSistemaPermitidas,
    obterInformacoesDesktop,
    obterInicializacaoComSistema,
} from "@/lib/config/desktop"
import { queryClient } from "@/lib/config/query-client"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

const CHAVE_PREFERENCIAS = [PreferenciasQueryKeys.ObterPreferencias]

const obterPreferenciasSincronizadas = async () => {
    const preferencias = await obterPreferencias()
    const [iniciarComSistema, notificacoesPermitidas] = await Promise.all([
        obterInicializacaoComSistema(),
        notificacoesDoSistemaPermitidas(),
    ])
    const sincronizadas = {
        ...preferencias,
        iniciarComSistema,
        notificacoesSistema: preferencias.notificacoesSistema && notificacoesPermitidas,
    }

    if (
        sincronizadas.iniciarComSistema !== preferencias.iniciarComSistema ||
        sincronizadas.notificacoesSistema !== preferencias.notificacoesSistema
    ) {
        await salvarPreferencias(sincronizadas)
    }

    return sincronizadas
}

export const useObterPreferencias = () => {
    const runtimeDisponivel = possuiRuntimeTauri()

    return useQuery({
        queryKey: CHAVE_PREFERENCIAS,
        queryFn: obterPreferenciasSincronizadas,
        enabled: runtimeDisponivel,
        staleTime: Number.POSITIVE_INFINITY,
        retry: false,
    })
}

export const useSalvarPreferencias = () => {
    return useMutation({
        mutationFn: (request: SalvarPreferencias.Request) => {
            if (!possuiRuntimeTauri()) return Promise.resolve(request)
            return salvarPreferencias(request)
        },
        onSuccess: (preferencias) => {
            queryClient.setQueryData(CHAVE_PREFERENCIAS, preferencias)
        },
    })
}

export const useObterInformacoesDesktop = () => {
    return useQuery<ObterInformacoesDesktop.Response>({
        queryKey: [PreferenciasQueryKeys.ObterInformacoesDesktop],
        queryFn: obterInformacoesDesktop,
        staleTime: Number.POSITIVE_INFINITY,
        retry: false,
    })
}

export const useRevelarBancoDados = () => {
    return useMutation<RevelarBancoDados.Response>({
        mutationFn: revelarBancoDados,
    })
}

export const useExportarBackupBancoDados = () => {
    return useMutation<ExportarBackupBancoDados.Response>({
        mutationFn: exportarBackupBancoDados,
    })
}
