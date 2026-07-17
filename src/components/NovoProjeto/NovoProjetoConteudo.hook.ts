import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useObterConexoesGitHub, useObterRepositoriosGitHub } from "@/backend/api/controllers/github"
import { useCriarProjeto } from "@/backend/api/controllers/projeto"
import { useObterConexaoRailway, useObterProjetosRailway } from "@/backend/api/controllers/railway"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel, useObterProjetosVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import type { CriarProjeto } from "@/backend/api/models/projeto.types"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type { ProjetoRailway, ServicoRailway } from "@/backend/api/models/railway.types"
import type { ProjetoSupabase } from "@/backend/api/models/supabase.types"
import type { ProjetoVercel } from "@/backend/api/models/vercel.types"
import type {
    EtapaNovoProjeto,
    FormularioNovoProjeto,
    ServicoSelecionado,
} from "@/components/NovoProjeto/NovoProjeto.types"
import {
    criarFormularioNovoProjeto,
    identificarServico,
} from "@/components/NovoProjeto/NovoProjeto.utils"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarStatusProjetoVercel } from "@/lib/utils/vercel"

export const useNovoProjetoConteudo = (open: boolean, onClose: () => void) => {
    const navigate = useNavigate()

    const [etapa, setEtapa] = useState<EtapaNovoProjeto>(1)
    const [formulario, setFormulario] = useState(criarFormularioNovoProjeto)

    const runtimeDisponivel = possuiRuntimeTauri()

    const { mutateAsync: criarProjeto, isPending: criarProjetoIsPending } = useCriarProjeto()

    const { data: conexoesGitHub = [], isLoading: conexoesGitHubIsLoading } = useObterConexoesGitHub()
    
    const {
        data: repositoriosData,
        isLoading: repositoriosIsLoading,
        isFetching: repositoriosIsFetching,
        refetch: atualizarRepositorios,
    } = useObterRepositoriosGitHub({}, open && conexoesGitHub.length > 0)

    const { data: conexaoVercel, isLoading: conexaoVercelIsLoading } = useObterConexaoVercel()

    const {
        data: projetosVercelData,
        isLoading: projetosVercelIsLoading,
        isFetching: projetosVercelIsFetching,
        refetch: atualizarProjetosVercel,
    } = useObterProjetosVercel(open && Boolean(conexaoVercel))

    const { data: conexaoSupabase, isLoading: conexaoSupabaseIsLoading } = useObterConexaoSupabase()

    const {
        data: projetosSupabaseData,
        isLoading: projetosSupabaseIsLoading,
        isFetching: projetosSupabaseIsFetching,
        refetch: atualizarProjetosSupabase,
    } = useObterProjetosSupabase(open && Boolean(conexaoSupabase))

    const { data: conexaoRailway, isLoading: conexaoRailwayIsLoading } = useObterConexaoRailway()

    const {
        data: projetosRailwayData,
        isLoading: projetosRailwayIsLoading,
        isFetching: projetosRailwayIsFetching,
        refetch: atualizarProjetosRailway,
    } = useObterProjetosRailway(open && Boolean(conexaoRailway))

    const alterarFormulario = <Campo extends keyof FormularioNovoProjeto>(
        campo: Campo,
        valor: FormularioNovoProjeto[Campo]
    ) => setFormulario((atual) => ({ ...atual, [campo]: valor }))

    const alternarServico = (servico: ServicoSelecionado) => {
        setFormulario((atual) => {
            const id = identificarServico(servico)
            const selecionado = atual.servicos.some((item) => identificarServico(item) === id)
            if (!selecionado) return { ...atual, servicos: [...atual.servicos, servico] }

            const relacionamentos = { ...atual.relacionamentos }
            delete relacionamentos[id]
            return {
                ...atual,
                servicos: atual.servicos.filter((item) => identificarServico(item) !== id),
                relacionamentos,
            }
        })
    }

    const alterarServico = (
        servico: ServicoSelecionado,
        alteracao: Partial<Pick<ServicoSelecionado, "tipo" | "critico">>
    ) => {
        const id = identificarServico(servico)
        alterarFormulario(
            "servicos",
            formulario.servicos.map((item) =>
                identificarServico(item) === id ? { ...item, ...alteracao } : item
            )
        )
    }

    const alternarServicoVercel = (projeto: ProjetoVercel) => {
        alternarServico({
            provider: Enum.Provider.Vercel,
            externalProjectId: projeto.id,
            externalEnvironmentId: null,
            externalServiceId: null,
            scopeId: projeto.escopo.id,
            nome: projeto.nome,
            tipo: Enum.TipoServico.Frontend,
            critico: true,
            status: normalizarStatusProjetoVercel(projeto.ultimoDeployment?.estado),
            snapshot: projeto,
        })
    }

    const alternarServicoSupabase = (projeto: ProjetoSupabase) => {
        alternarServico({
            provider: Enum.Provider.Supabase,
            externalProjectId: projeto.ref,
            externalEnvironmentId: null,
            externalServiceId: projeto.banco?.identifier ?? null,
            scopeId: projeto.organizacaoSlug,
            nome: projeto.nome,
            tipo: Enum.TipoServico.BancoDados,
            critico: true,
            status: projeto.status,
            snapshot: projeto,
        })
    }

    const alternarServicoRailway = (
        projeto: ProjetoRailway,
        servico: ServicoRailway,
        tipo: Enum.TipoServico
    ) => {
        alternarServico({
            provider: Enum.Provider.Railway,
            externalProjectId: projeto.id,
            externalEnvironmentId: servico.environmentId,
            externalServiceId: servico.id,
            scopeId: projeto.workspaceId,
            nome: servico.nome,
            tipo,
            critico: true,
            status: servico.status,
            snapshot: { ...servico, projetoNome: projeto.nome },
        })
    }

    const alternarRepositorio = (repositorio: RepositorioGitHub) => {
        setFormulario((atual) => {
            const selecionado = atual.repositorios.some(
                ({ repositoryId }) => repositoryId === repositorio.id
            )
            if (!selecionado) {
                return {
                    ...atual,
                    repositorios: [
                        ...atual.repositorios,
                        {
                            repositoryId: repositorio.id,
                            connectionId: repositorio.connectionId,
                            tag: Enum.TagRepositorio.Documentacao,
                        },
                    ],
                }
            }

            const repositoryId = String(repositorio.id)
            return {
                ...atual,
                repositorios: atual.repositorios.filter((item) => item.repositoryId !== repositorio.id),
                relacionamentos: Object.fromEntries(
                    Object.entries(atual.relacionamentos).map(([servicoId, valor]) => [
                        servicoId,
                        valor === repositoryId ? null : valor,
                    ])
                ),
            }
        })
    }

    const alterarTagRepositorio = (repositoryId: number, tag: Enum.TagRepositorio) => {
        alterarFormulario(
            "repositorios",
            formulario.repositorios.map((item) =>
                item.repositoryId === repositoryId ? { ...item, tag } : item
            )
        )
    }

    const alterarRelacionamento = (servico: ServicoSelecionado, repositoryId: string | null) => {
        alterarFormulario("relacionamentos", {
            ...formulario.relacionamentos,
            [identificarServico(servico)]: repositoryId,
        })
    }

    const voltar = () => setEtapa((valor) => Math.max(1, valor - 1) as EtapaNovoProjeto)
    const continuar = () => {
        if (etapa === 1 && !formulario.nome.trim()) {
            toast.error("Informe o nome do projeto.")
            return
        }
        setEtapa((valor) => Math.min(5, valor + 1) as EtapaNovoProjeto)
    }

    useEffect(() => {
        if (!open) {
            setEtapa(1)
            setFormulario(criarFormularioNovoProjeto())
        }
    }, [open])

    const montarRequest = (): CriarProjeto.Request => {
        const repositorios = repositoriosData?.repositories ?? []
        return {
            nome: formulario.nome.trim(),
            descricao: formulario.descricao.trim(),
            urlAplicacao: formulario.urlAplicacao.trim() || null,
            repositorios: formulario.repositorios.flatMap((selecionado) => {
                const repositorio = repositorios.find(({ id }) => id === selecionado.repositoryId)
                if (!repositorio) return []
                return [
                    {
                        externalId: String(repositorio.id),
                        connectionId: repositorio.connectionId,
                        nome: repositorio.nome,
                        fullName: repositorio.fullName,
                        htmlUrl: repositorio.htmlUrl,
                        tag: selecionado.tag,
                        snapshot: repositorio,
                    },
                ]
            }),
            servicos: formulario.servicos.map((servico) => ({
                ...servico,
                repositorioExternalId: formulario.relacionamentos[identificarServico(servico)] ?? null,
            })),
            intervaloVerificacaoSegundos: formulario.intervaloVerificacao,
            timeoutSegundos: formulario.timeout,
            notificacoesAtivas: formulario.notificacoes,
            coletarDeployments: formulario.coletarDeployments,
        }
    }

    const concluir = async () => {
        if (!formulario.nome.trim()) {
            toast.error("Informe o nome do projeto.")
            setEtapa(1)
            return
        }
        if (formulario.urlAplicacao.trim()) {
            try {
                new URL(formulario.urlAplicacao)
            } catch {
                toast.error("Informe uma URL válida para a aplicação.")
                setEtapa(1)
                return
            }
        }

        const criacao = criarProjeto(montarRequest())
        toast.promise(criacao, {
            loading: "Criando projeto...",
            success: "Projeto criado com sucesso.",
            error: (erro) =>
                erro instanceof Error ? erro.message : "Não foi possível criar o projeto.",
        })
        try {
            const projeto = await criacao
            setFormulario(criarFormularioNovoProjeto())
            setEtapa(1)
            onClose()
            void navigate(`/projetos/${projeto.id}`)
        } catch {
            return
        }
    }

    const repositorios = repositoriosData?.repositories ?? []
    return {
        etapa,
        formulario,
        repositorios,
        repositoriosRelacionamento: repositorios.filter((repositorio) =>
            formulario.repositorios.some(({ repositoryId }) => repositoryId === repositorio.id)
        ),
        repositoriosIsLoading: conexoesGitHubIsLoading || repositoriosIsLoading,
        repositoriosIsFetching,
        repositoriosFalhas: repositoriosData?.failures ?? [],
        quantidadeConexoes: conexoesGitHub.length,
        runtimeDisponivel,
        criarProjetoIsPending,
        vercel: {
            projetos: projetosVercelData?.projects ?? [],
            configurada: Boolean(conexaoVercel),
            runtimeDisponivel,
            isLoading: conexaoVercelIsLoading || (Boolean(conexaoVercel) && projetosVercelIsLoading),
            isFetching: projetosVercelIsFetching,
            falhas: projetosVercelData?.failures ?? [],
            alternar: alternarServicoVercel,
            atualizar: () => void atualizarProjetosVercel(),
        },
        supabase: {
            projetos: projetosSupabaseData?.projects ?? [],
            configurada: Boolean(conexaoSupabase),
            runtimeDisponivel,
            isLoading:
                conexaoSupabaseIsLoading || (Boolean(conexaoSupabase) && projetosSupabaseIsLoading),
            isFetching: projetosSupabaseIsFetching,
            falhas: projetosSupabaseData?.failures ?? [],
            alternar: alternarServicoSupabase,
            atualizar: () => void atualizarProjetosSupabase(),
        },
        railway: {
            projetos: projetosRailwayData?.projects ?? [],
            configurada: Boolean(conexaoRailway),
            runtimeDisponivel,
            isLoading: conexaoRailwayIsLoading || (Boolean(conexaoRailway) && projetosRailwayIsLoading),
            isFetching: projetosRailwayIsFetching,
            falhas: projetosRailwayData?.failures ?? [],
            alternar: alternarServicoRailway,
            alterarTipo: (servico: ServicoSelecionado, tipo: Enum.TipoServico) =>
                alterarServico(servico, { tipo }),
            alterarCriticidade: (servico: ServicoSelecionado, critico: boolean) =>
                alterarServico(servico, { critico }),
            atualizar: () => void atualizarProjetosRailway(),
        },
        voltar,
        continuar,
        concluir,
        alterarFormulario,
        alternarRepositorio,
        alterarTagRepositorio,
        alterarRelacionamento,
        atualizarRepositorios,
    }
}
