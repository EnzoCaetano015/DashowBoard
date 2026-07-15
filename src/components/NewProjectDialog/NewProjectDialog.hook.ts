import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexoesGitHub,
    useObterRepositoriosGitHub,
} from "@/backend/api/controllers/github"
import { Enum } from "@/backend/api/enums/enum"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type {
    EtapaNovoProjeto,
    RepositorioSelecionado,
} from "@/components/NewProjectDialog/NewProjectDialog.types"
import { normalizarErroGitHub } from "@/lib/utils/github"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useNewProjectDialog = () => {
    const [aberto, setAberto] = useState(false)
    const [etapa, setEtapa] = useState<EtapaNovoProjeto>(1)
    const [repositoriosSelecionados, setRepositoriosSelecionados] = useState<
        RepositorioSelecionado[]
    >([])
    const [servicos, setServicos] = useState<string[]>([])
    const connectionsQuery = useObterConexoesGitHub()
    const repositoriesQuery = useObterRepositoriosGitHub(
        {},
        aberto && (connectionsQuery.data?.length ?? 0) > 0
    )

    const alternarServico = (id: string) => {
        setServicos((values) =>
            values.includes(id) ? values.filter((value) => value !== id) : [...values, id]
        )
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
            description: `${repositoriosSelecionados.length} repositório(s) real(is) selecionado(s).`,
        })
    }

    return {
        aberto,
        etapa,
        repositorios: repositoriesQuery.data?.repositories ?? [],
        repositoriosSelecionados,
        repositoriosRelacionamento: (repositoriesQuery.data?.repositories ?? []).filter(
            (repository) =>
                repositoriosSelecionados.some((selected) => selected.repositoryId === repository.id)
        ),
        repositoriosIsLoading: connectionsQuery.isLoading || repositoriesQuery.isLoading,
        repositoriosIsFetching: repositoriesQuery.isFetching,
        repositoriosIsError: connectionsQuery.isError || repositoriesQuery.isError,
        repositoriosErro: normalizarErroGitHub(
            connectionsQuery.error ?? repositoriesQuery.error
        ).message,
        repositoriosFalhas: repositoriesQuery.data?.failures ?? [],
        quantidadeConexoes: connectionsQuery.data?.length ?? 0,
        runtimeDisponivel: possuiRuntimeTauri(),
        servicos,
        alterarAberto,
        voltar,
        continuar,
        concluir,
        alternarRepositorio,
        alterarTagRepositorio,
        alternarServico,
        tentarNovamenteRepositorios: async () => {
            await Promise.all([connectionsQuery.refetch(), repositoriesQuery.refetch()])
        },
        atualizarRepositorios: repositoriesQuery.refetch,
    }
}
