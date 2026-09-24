import { useQueries } from "@tanstack/react-query"

import { useObterPreferencias } from "@/backend/api/controllers/preferencias"
import { verificarHealthCheckProjeto } from "@/backend/api/integrations/health-check"
import { HealthCheckQueryKeys } from "@/backend/api/models/health-check.types"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useObterHealthChecksProjetos = (projetos: ObterProjetos.Projeto[]) => {
    const { data: preferencias = PREFERENCIAS_PADRAO } = useObterPreferencias()
    const projetosMonitorados = projetos.filter(
        (projeto): projeto is ObterProjetos.Projeto & { urlAplicacao: string } =>
            Boolean(projeto.urlAplicacao)
    )
    const consultas = useQueries({
        queries: projetosMonitorados.map((projeto) => ({
            queryKey: [
                HealthCheckQueryKeys.VerificarProjeto,
                projeto.id,
                projeto.urlAplicacao,
                projeto.timeoutSegundos,
            ],
            queryFn: () =>
                verificarHealthCheckProjeto({
                    projetoId: projeto.id,
                    url: projeto.urlAplicacao,
                    timeoutSegundos: projeto.timeoutSegundos,
                }),
            enabled: possuiRuntimeTauri(),
            staleTime: projeto.intervaloVerificacaoSegundos * 1000,
            refetchInterval: projeto.intervaloVerificacaoSegundos * 1000,
            refetchIntervalInBackground: preferencias.verificacaoSegundoPlano,
            refetchOnReconnect: true,
            retry: false,
        })),
    })

    return {
        healthChecks: projetosMonitorados.map((projeto, indice) => ({
            projetoId: projeto.id,
            consulta: consultas[indice],
        })),
    }
}
