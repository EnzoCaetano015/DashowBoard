import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { useObterHealthChecksProjetos } from "@/backend/api/controllers/health-check"
import {
    useObterProjetos,
    useSalvarSnapshotsServicos,
    useSalvarVerificacoesProjeto,
} from "@/backend/api/controllers/projeto"
import { useObterConexaoRailway, useObterProjetosRailway } from "@/backend/api/controllers/railway"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel, useObterProjetosVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import type {
    SalvarSnapshotsServicos,
    SalvarVerificacoesProjeto,
} from "@/backend/api/models/projeto.types"
import { resolverAtualizacaoMonitoramento } from "@/lib/utils/monitoramento"
import { normalizarStatusProjetoVercel } from "@/lib/utils/vercel"

export const useMonitoramentoProjetos = () => {
    const assinaturas = useRef(new Map<string, string>())
    const assinaturasHealthCheck = useRef(new Map<string, string>())
    const { data: projetos = [] } = useObterProjetos()
    const { data: conexaoVercel } = useObterConexaoVercel()
    const {
        data: projetosVercel,
        isError: projetosVercelIsError,
        isFetched: projetosVercelIsFetched,
        isFetching: projetosVercelIsFetching,
        error: projetosVercelError,
        dataUpdatedAt: projetosVercelAtualizadoEm,
        errorUpdatedAt: projetosVercelErroEm,
    } = useObterProjetosVercel(Boolean(conexaoVercel))
    const { data: conexaoSupabase } = useObterConexaoSupabase()
    const {
        data: projetosSupabase,
        isError: projetosSupabaseIsError,
        isFetched: projetosSupabaseIsFetched,
        isFetching: projetosSupabaseIsFetching,
        error: projetosSupabaseError,
        dataUpdatedAt: projetosSupabaseAtualizadoEm,
        errorUpdatedAt: projetosSupabaseErroEm,
    } = useObterProjetosSupabase(Boolean(conexaoSupabase))
    const { data: conexaoRailway } = useObterConexaoRailway()
    const {
        data: projetosRailway,
        isError: projetosRailwayIsError,
        isFetched: projetosRailwayIsFetched,
        isFetching: projetosRailwayIsFetching,
        error: projetosRailwayError,
        dataUpdatedAt: projetosRailwayAtualizadoEm,
        errorUpdatedAt: projetosRailwayErroEm,
    } = useObterProjetosRailway(Boolean(conexaoRailway))
    const { healthChecks } = useObterHealthChecksProjetos(projetos)
    const { mutateAsync: salvarSnapshots } = useSalvarSnapshotsServicos()
    const { mutateAsync: salvarVerificacoes } = useSalvarVerificacoesProjeto()

    useEffect(() => {
        const atualizacoes: SalvarSnapshotsServicos.Atualizacao[] = []
        for (const projeto of projetos) {
            for (const servico of projeto.servicos) {
                let atualizacao: SalvarSnapshotsServicos.Atualizacao | null = null
                let atualizadoEm = 0

                if (servico.provider === Enum.Provider.Vercel) {
                    const remoto = projetosVercel?.projects.find(
                        (item) =>
                            item.id === servico.externalProjectId && item.escopo.id === servico.scopeId
                    )
                    const falha = projetosVercel?.failures.find(
                        ({ scopeId }) => scopeId === servico.scopeId
                    )
                    atualizacao = resolverAtualizacaoMonitoramento({
                        servicoId: servico.id,
                        coletaConcluida: projetosVercelIsFetched && !projetosVercelIsFetching,
                        recurso:
                            remoto && !projetosVercelIsError
                                ? {
                                      status: normalizarStatusProjetoVercel(
                                          remoto.ultimoDeployment?.estado
                                      ),
                                      snapshot: remoto,
                                  }
                                : undefined,
                        erro: projetosVercelIsError ? projetosVercelError : undefined,
                        mensagemFalhaParcial: falha?.message,
                    })
                    atualizadoEm = projetosVercelIsError
                        ? projetosVercelErroEm
                        : projetosVercelAtualizadoEm
                }

                if (servico.provider === Enum.Provider.Supabase) {
                    const remoto = projetosSupabase?.projects.find(
                        (item) =>
                            item.ref === servico.externalProjectId &&
                            item.organizacaoSlug === servico.scopeId
                    )
                    const falha = projetosSupabase?.failures.find(
                        ({ organizacaoSlug }) => organizacaoSlug === servico.scopeId
                    )
                    atualizacao = resolverAtualizacaoMonitoramento({
                        servicoId: servico.id,
                        coletaConcluida: projetosSupabaseIsFetched && !projetosSupabaseIsFetching,
                        recurso:
                            remoto && !projetosSupabaseIsError
                                ? { status: remoto.status, snapshot: remoto }
                                : undefined,
                        erro: projetosSupabaseIsError ? projetosSupabaseError : undefined,
                        mensagemFalhaParcial: falha?.message,
                    })
                    atualizadoEm = projetosSupabaseIsError
                        ? projetosSupabaseErroEm
                        : projetosSupabaseAtualizadoEm
                }

                if (servico.provider === Enum.Provider.Railway) {
                    const projetoRemoto = projetosRailway?.projects.find(
                        (item) =>
                            item.id === servico.externalProjectId && item.workspaceId === servico.scopeId
                    )
                    const ambiente = projetoRemoto?.ambientes.find(
                        ({ id }) => id === servico.externalEnvironmentId
                    )
                    const remoto = ambiente?.servicos.find(({ id }) => id === servico.externalServiceId)
                    const falha = projetosRailway?.failures.find(
                        ({ workspaceId, projectId }) =>
                            workspaceId === servico.scopeId &&
                            (!projectId || projectId === servico.externalProjectId)
                    )
                    atualizacao = resolverAtualizacaoMonitoramento({
                        servicoId: servico.id,
                        coletaConcluida: projetosRailwayIsFetched && !projetosRailwayIsFetching,
                        recurso:
                            remoto && !projetosRailwayIsError
                                ? {
                                      status: remoto.status,
                                      snapshot: { ...remoto, projetoNome: projetoRemoto?.nome },
                                  }
                                : undefined,
                        erro: projetosRailwayIsError ? projetosRailwayError : undefined,
                        mensagemFalhaParcial: falha?.message,
                    })
                    atualizadoEm = projetosRailwayIsError
                        ? projetosRailwayErroEm
                        : projetosRailwayAtualizadoEm
                }

                if (!atualizacao) continue
                const assinatura = JSON.stringify([atualizacao, atualizadoEm])
                if (assinaturas.current.get(servico.id) === assinatura) continue
                assinaturas.current.set(servico.id, assinatura)
                atualizacoes.push(atualizacao)
            }
        }

        if (atualizacoes.length === 0) return
        void salvarSnapshots({ atualizacoes }).catch(() => {
            for (const { servicoId } of atualizacoes) assinaturas.current.delete(servicoId)
            toast.error("Não foi possível persistir as atualizações do monitoramento.", {
                id: "erro-persistencia-monitoramento",
            })
        })
    }, [
        projetos,
        projetosRailway,
        projetosRailwayAtualizadoEm,
        projetosRailwayErroEm,
        projetosRailwayError,
        projetosRailwayIsError,
        projetosRailwayIsFetched,
        projetosRailwayIsFetching,
        projetosSupabase,
        projetosSupabaseAtualizadoEm,
        projetosSupabaseErroEm,
        projetosSupabaseError,
        projetosSupabaseIsError,
        projetosSupabaseIsFetched,
        projetosSupabaseIsFetching,
        projetosVercel,
        projetosVercelAtualizadoEm,
        projetosVercelErroEm,
        projetosVercelError,
        projetosVercelIsError,
        projetosVercelIsFetched,
        projetosVercelIsFetching,
        salvarSnapshots,
    ])

    useEffect(() => {
        const atualizacoes: SalvarVerificacoesProjeto.Atualizacao[] = []
        const novasAssinaturas = new Map<string, string>()
        for (const { projetoId, consulta } of healthChecks) {
            if (!consulta.data || consulta.isFetching) continue
            const projeto = projetos.find(({ id }) => id === projetoId)
            if (!projeto?.urlAplicacao) continue
            const assinatura = JSON.stringify(consulta.data)
            if (assinaturasHealthCheck.current.get(projetoId) === assinatura) continue
            assinaturasHealthCheck.current.set(projetoId, assinatura)
            novasAssinaturas.set(projetoId, assinatura)
            atualizacoes.push({
                projetoId,
                url: projeto.urlAplicacao,
                status: consulta.data.status,
                statusHttp: consulta.data.statusHttp,
                responseTimeMs: consulta.data.tempoRespostaMs,
                mensagem: consulta.data.mensagem,
                verificadoEm: consulta.data.verificadoEm,
            })
        }

        if (atualizacoes.length === 0) return
        void salvarVerificacoes({ atualizacoes }).catch(() => {
            for (const [projetoId, assinatura] of novasAssinaturas) {
                if (assinaturasHealthCheck.current.get(projetoId) === assinatura) {
                    assinaturasHealthCheck.current.delete(projetoId)
                }
            }
            toast.error("Não foi possível persistir os health checks dos projetos.", {
                id: "erro-persistencia-health-checks",
            })
        })
    }, [healthChecks, projetos, salvarVerificacoes])
}
