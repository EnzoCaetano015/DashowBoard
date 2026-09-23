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
    CampoInformacoesNovoProjeto,
    EtapaNovoProjeto,
    FormularioNovoProjeto,
    ServicoSelecionado,
} from "@/components/NovoProjeto/NovoProjeto.types"
import {
    criarFormularioNovoProjeto,
    formularioNovoProjetoFoiAlterado,
    identificarServico,
    inferirTagRepositorio,
    obterErrosInformacoesNovoProjeto,
} from "@/components/NovoProjeto/NovoProjeto.utils"
import { obterMensagemErro } from "@/lib/utils/error"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarStatusProjetoVercel } from "@/lib/utils/vercel"

export const useNovoProjetoConteudo = (open: boolean, onClose: () => void) => {
    const navigate = useNavigate()

    const [etapa, setEtapa] = useState<EtapaNovoProjeto>(1)
    const [maiorEtapaVisitada, setMaiorEtapaVisitada] = useState<EtapaNovoProjeto>(1)
    const [formulario, setFormulario] = useState(criarFormularioNovoProjeto)
    const [camposValidados, setCamposValidados] = useState<Record<CampoInformacoesNovoProjeto, boolean>>({
        nome: false,
        urlAplicacao: false,
    })
    const [confirmacaoDescarteAberta, setConfirmacaoDescarteAberta] = useState(false)

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
                            tag: inferirTagRepositorio(repositorio),
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

    const errosInformacoes = obterErrosInformacoesNovoProjeto(formulario)
    const errosInformacoesVisiveis = {
        nome: camposValidados.nome ? errosInformacoes.nome : undefined,
        urlAplicacao: camposValidados.urlAplicacao ? errosInformacoes.urlAplicacao : undefined,
    }

    const validarCampo = (campo: CampoInformacoesNovoProjeto) => {
        setCamposValidados((atuais) => ({ ...atuais, [campo]: true }))
    }

    const focarPrimeiroCampoInvalido = () => {
        const id = errosInformacoes.nome ? "novo-projeto-nome" : "novo-projeto-url"
        document.getElementById(id)?.focus()
    }

    const validarInformacoes = () => {
        setCamposValidados({ nome: true, urlAplicacao: true })
        if (Object.keys(errosInformacoes).length === 0) return true
        focarPrimeiroCampoInvalido()
        return false
    }

    const irParaEtapa = (destino: EtapaNovoProjeto) => {
        if (destino > maiorEtapaVisitada) return
        if (destino > 1 && !validarInformacoes()) return
        setEtapa(destino)
    }

    const editarEtapa = (destino: Exclude<EtapaNovoProjeto, 6>) => setEtapa(destino)
    const voltar = () => setEtapa((valor) => Math.max(1, valor - 1) as EtapaNovoProjeto)
    const continuar = () => {
        if (etapa === 1 && !validarInformacoes()) return
        const proximaEtapa = Math.min(6, etapa + 1) as EtapaNovoProjeto
        setEtapa(proximaEtapa)
        setMaiorEtapaVisitada((atual) => Math.max(atual, proximaEtapa) as EtapaNovoProjeto)
    }

    const resetarFormulario = () => {
        setEtapa(1)
        setMaiorEtapaVisitada(1)
        setFormulario(criarFormularioNovoProjeto())
        setCamposValidados({ nome: false, urlAplicacao: false })
        setConfirmacaoDescarteAberta(false)
    }

    const solicitarFechamento = () => {
        if (criarProjetoIsPending) return
        if (formularioNovoProjetoFoiAlterado(formulario)) {
            setConfirmacaoDescarteAberta(true)
            return
        }
        resetarFormulario()
        onClose()
    }

    const manterEditando = () => setConfirmacaoDescarteAberta(false)
    const descartarAlteracoes = () => {
        resetarFormulario()
        onClose()
    }

    useEffect(() => {
        if (!open) resetarFormulario()
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
        if (!validarInformacoes()) {
            toast.error(errosInformacoes.nome ?? errosInformacoes.urlAplicacao)
            setEtapa(1)
            requestAnimationFrame(focarPrimeiroCampoInvalido)
            return
        }

        const criacao = criarProjeto(montarRequest())
        toast.promise(criacao, {
            loading: "Criando projeto...",
            success: "Projeto criado com sucesso.",
            error: (erro) => obterMensagemErro(erro, "Não foi possível criar o projeto."),
        })
        try {
            const projeto = await criacao
            resetarFormulario()
            onClose()
            void navigate(`/projetos/${projeto.id}`)
        } catch {
            return
        }
    }

    const repositorios = repositoriosData?.repositories ?? []
    return {
        etapa,
        maiorEtapaVisitada,
        formulario,
        errosInformacoes: errosInformacoesVisiveis,
        confirmacaoDescarteAberta,
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
        irParaEtapa,
        editarEtapa,
        validarCampo,
        solicitarFechamento,
        manterEditando,
        descartarAlteracoes,
        alterarFormulario,
        alternarRepositorio,
        alterarTagRepositorio,
        alterarRelacionamento,
        atualizarRepositorios,
    }
}
