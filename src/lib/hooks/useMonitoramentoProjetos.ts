import { useEffect, useRef } from "react"

import { useObterProjetos, useSalvarSnapshotServico } from "@/backend/api/controllers/projeto"
import { useObterConexaoRailway, useObterProjetosRailway } from "@/backend/api/controllers/railway"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel, useObterProjetosVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import type { SalvarSnapshotServico } from "@/backend/api/models/projeto.types"
import { normalizarStatusProjetoVercel } from "@/lib/utils/vercel"

export const useMonitoramentoProjetos = () => {
    const assinaturas = useRef(new Map<string, string>())
    const { data: projetos = [] } = useObterProjetos()
    const { data: conexaoVercel } = useObterConexaoVercel()
    const {
        data: projetosVercel,
        isError: projetosVercelIsError,
        dataUpdatedAt: projetosVercelAtualizadoEm,
        errorUpdatedAt: projetosVercelErroEm,
    } = useObterProjetosVercel(Boolean(conexaoVercel))
    const { data: conexaoSupabase } = useObterConexaoSupabase()
    const {
        data: projetosSupabase,
        isError: projetosSupabaseIsError,
        dataUpdatedAt: projetosSupabaseAtualizadoEm,
        errorUpdatedAt: projetosSupabaseErroEm,
    } = useObterProjetosSupabase(Boolean(conexaoSupabase))
    const { data: conexaoRailway } = useObterConexaoRailway()
    const {
        data: projetosRailway,
        isError: projetosRailwayIsError,
        dataUpdatedAt: projetosRailwayAtualizadoEm,
        errorUpdatedAt: projetosRailwayErroEm,
    } = useObterProjetosRailway(Boolean(conexaoRailway))
    const { mutateAsync: salvarSnapshot } = useSalvarSnapshotServico()

    useEffect(() => {
        const atualizacoes: SalvarSnapshotServico.Request[] = []

        for (const projeto of projetos) {
            for (const servico of projeto.servicos) {
                let atualizacao: SalvarSnapshotServico.Request | null = null

                if (servico.provider === Enum.Provider.Vercel) {
                    const remoto = projetosVercel?.projects.find(
                        (item) =>
                            item.id === servico.externalProjectId && item.escopo.id === servico.scopeId
                    )
                    if (remoto) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: normalizarStatusProjetoVercel(remoto.ultimoDeployment?.estado),
                            snapshot: remoto,
                        }
                    } else if (projetosVercelIsError) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: Enum.StatusProjeto.Desconhecido,
                        }
                    }
                }

                if (servico.provider === Enum.Provider.Supabase) {
                    const remoto = projetosSupabase?.projects.find(
                        (item) =>
                            item.ref === servico.externalProjectId &&
                            item.organizacaoSlug === servico.scopeId
                    )
                    if (remoto) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: remoto.status,
                            snapshot: remoto,
                        }
                    } else if (projetosSupabaseIsError) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: Enum.StatusProjeto.Desconhecido,
                        }
                    }
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
                    if (remoto) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: remoto.status,
                            snapshot: { ...remoto, projetoNome: projetoRemoto?.nome },
                        }
                    } else if (projetosRailwayIsError) {
                        atualizacao = {
                            servicoId: servico.id,
                            status: Enum.StatusProjeto.Desconhecido,
                        }
                    }
                }

                if (!atualizacao) continue
                const atualizadoEm =
                    servico.provider === Enum.Provider.Vercel
                        ? projetosVercelIsError
                            ? projetosVercelErroEm
                            : projetosVercelAtualizadoEm
                        : servico.provider === Enum.Provider.Supabase
                          ? projetosSupabaseIsError
                              ? projetosSupabaseErroEm
                              : projetosSupabaseAtualizadoEm
                          : projetosRailwayIsError
                            ? projetosRailwayErroEm
                            : projetosRailwayAtualizadoEm
                const assinatura = JSON.stringify([
                    atualizacao.status,
                    atualizacao.snapshot,
                    atualizadoEm,
                ])
                if (assinaturas.current.get(servico.id) === assinatura) continue
                assinaturas.current.set(servico.id, assinatura)
                atualizacoes.push(atualizacao)
            }
        }

        if (atualizacoes.length === 0) return
        const persistir = async () => {
            for (const atualizacao of atualizacoes) {
                try {
                    await salvarSnapshot(atualizacao)
                } catch {
                    assinaturas.current.delete(atualizacao.servicoId)
                }
            }
        }
        void persistir()
    }, [
        projetos,
        projetosRailway,
        projetosRailwayAtualizadoEm,
        projetosRailwayErroEm,
        projetosRailwayIsError,
        projetosSupabase,
        projetosSupabaseAtualizadoEm,
        projetosSupabaseErroEm,
        projetosSupabaseIsError,
        projetosVercel,
        projetosVercelAtualizadoEm,
        projetosVercelErroEm,
        projetosVercelIsError,
        salvarSnapshot,
    ])
}
