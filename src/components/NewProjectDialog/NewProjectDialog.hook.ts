import { useState } from "react"
import { toast } from "sonner"

import { useObterConexoesGitHub, useObterRepositoriosGitHub } from "@/backend/api/controllers/github"
import { useObterConexaoSupabase, useObterProjetosSupabase } from "@/backend/api/controllers/supabase"
import { useObterConexaoVercel, useObterProjetosVercel } from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type { ProjetoSupabase } from "@/backend/api/models/supabase.types"
import type { ProjetoVercel } from "@/backend/api/models/vercel.types"
import type {
    EtapaNovoProjeto,
    RepositorioSelecionado,
    ServicoSelecionado,
} from "@/components/NewProjectDialog/NewProjectDialog.types"
import { normalizarErroGitHub } from "@/lib/utils/github"
import { normalizarErroSupabase } from "@/lib/utils/supabase"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarErroVercel } from "@/lib/utils/vercel"

export const useNewProjectDialog = () => {
    const [aberto, setAberto] = useState(false)
    const [etapa, setEtapa] = useState<EtapaNovoProjeto>(1)
    const [repositoriosSelecionados, setRepositoriosSelecionados] = useState<RepositorioSelecionado[]>(
        []
    )
    const [servicos, setServicos] = useState<ServicoSelecionado[]>([])
    const runtimeDisponivel = possuiRuntimeTauri()

    const connectionsQuery = useObterConexoesGitHub()
    const repositoriesQuery = useObterRepositoriosGitHub(
        {},
        aberto && (connectionsQuery.data?.length ?? 0) > 0
    )
    const vercelConnectionQuery = useObterConexaoVercel()
    const vercelProjectsQuery = useObterProjetosVercel(aberto && Boolean(vercelConnectionQuery.data))
    const supabaseConnectionQuery = useObterConexaoSupabase()
    const supabaseProjectsQuery = useObterProjetosSupabase(
        aberto && runtimeDisponivel && Boolean(supabaseConnectionQuery.data)
    )

    const alternarServico = (servico: ServicoSelecionado) => {
        setServicos((values) => {
            const selecionado = values.some(
                (value) =>
                    value.provider === servico.provider &&
                    value.externalProjectId === servico.externalProjectId &&
                    value.scopeId === servico.scopeId
            )
            return selecionado
                ? values.filter(
                      (value) =>
                          value.provider !== servico.provider ||
                          value.externalProjectId !== servico.externalProjectId ||
                          value.scopeId !== servico.scopeId
                  )
                : [...values, servico]
        })
    }

    const alternarServicoVercel = (project: ProjetoVercel) => {
        alternarServico({
            provider: Enum.Provider.Vercel,
            externalProjectId: project.id,
            scopeId: project.escopo.id,
            tipo: Enum.TipoServico.Frontend,
        })
    }

    const alternarServicoSupabase = (project: ProjetoSupabase) => {
        alternarServico({
            provider: Enum.Provider.Supabase,
            externalProjectId: project.ref,
            scopeId: project.organizacaoSlug,
            tipo: Enum.TipoServico.BancoDados,
        })
    }

    const alternarRepositorio = (repository: RepositorioGitHub) => {
        setRepositoriosSelecionados((values) => {
            const selected = values.some((value) => value.repositoryId === repository.id)
            return selected
                ? values.filter((value) => value.repositoryId !== repository.id)
                : [
                      ...values,
                      {
                          repositoryId: repository.id,
                          connectionId: repository.connectionId,
                          tag: Enum.TagRepositorio.Documentacao,
                      },
                  ]
        })
    }

    const alterarTagRepositorio = (repositoryId: number, tag: Enum.TagRepositorio) => {
        setRepositoriosSelecionados((values) =>
            values.map((value) => (value.repositoryId === repositoryId ? { ...value, tag } : value))
        )
    }

    const voltar = () => setEtapa((valor) => Math.max(1, valor - 1) as EtapaNovoProjeto)
    const continuar = () => setEtapa((valor) => Math.min(5, valor + 1) as EtapaNovoProjeto)
    const alterarAberto = (valor: boolean) => {
        setAberto(valor)
        if (!valor) {
            setEtapa(1)
            setRepositoriosSelecionados([])
            setServicos([])
        }
    }
    const concluir = () => {
        alterarAberto(false)
        toast.info("Projeto ainda não persistido nesta etapa.", {
            description: `${repositoriosSelecionados.length} repositório(s) e ${servicos.length} serviço(s) selecionado(s).`,
        })
    }

    return {
        aberto,
        etapa,
        repositorios: repositoriesQuery.data?.repositories ?? [],
        repositoriosSelecionados,
        repositoriosRelacionamento: (repositoriesQuery.data?.repositories ?? []).filter((repository) =>
            repositoriosSelecionados.some((selected) => selected.repositoryId === repository.id)
        ),
        repositoriosIsLoading: connectionsQuery.isLoading || repositoriesQuery.isLoading,
        repositoriosIsFetching: repositoriesQuery.isFetching,
        repositoriosIsError: connectionsQuery.isError || repositoriesQuery.isError,
        repositoriosErro: normalizarErroGitHub(connectionsQuery.error ?? repositoriesQuery.error)
            .message,
        repositoriosFalhas: repositoriesQuery.data?.failures ?? [],
        quantidadeConexoes: connectionsQuery.data?.length ?? 0,
        runtimeDisponivel,
        servicos,
        vercel: {
            projetos: vercelProjectsQuery.data?.projects ?? [],
            configurada: Boolean(vercelConnectionQuery.data),
            runtimeDisponivel,
            isLoading:
                vercelConnectionQuery.isLoading ||
                (Boolean(vercelConnectionQuery.data) && vercelProjectsQuery.isLoading),
            isFetching: vercelProjectsQuery.isFetching,
            isError: vercelConnectionQuery.isError || vercelProjectsQuery.isError,
            erro: normalizarErroVercel(vercelConnectionQuery.error ?? vercelProjectsQuery.error).message,
            falhas: vercelProjectsQuery.data?.failures ?? [],
            alternar: alternarServicoVercel,
            tentarNovamente: async () => {
                const connection = await vercelConnectionQuery.refetch()
                if (connection.data) await vercelProjectsQuery.refetch()
            },
            atualizar: vercelProjectsQuery.refetch,
        },
        supabase: {
            projetos: supabaseProjectsQuery.data?.projects ?? [],
            configurada: Boolean(supabaseConnectionQuery.data),
            runtimeDisponivel,
            isLoading:
                supabaseConnectionQuery.isLoading ||
                (Boolean(supabaseConnectionQuery.data) && supabaseProjectsQuery.isLoading),
            isFetching: supabaseProjectsQuery.isFetching,
            isError: supabaseConnectionQuery.isError || supabaseProjectsQuery.isError,
            erro: normalizarErroSupabase(supabaseConnectionQuery.error ?? supabaseProjectsQuery.error)
                .message,
            falhas: supabaseProjectsQuery.data?.failures ?? [],
            alternar: alternarServicoSupabase,
            tentarNovamente: async () => {
                const connection = await supabaseConnectionQuery.refetch()
                if (connection.data) await supabaseProjectsQuery.refetch()
            },
            atualizar: supabaseProjectsQuery.refetch,
        },
        alterarAberto,
        voltar,
        continuar,
        concluir,
        alternarRepositorio,
        alterarTagRepositorio,
        tentarNovamenteRepositorios: async () => {
            const connections = await connectionsQuery.refetch()
            if ((connections.data?.length ?? 0) > 0) await repositoriesQuery.refetch()
        },
        atualizarRepositorios: repositoriesQuery.refetch,
    }
}
