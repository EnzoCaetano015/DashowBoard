import { useIsFetching } from "@tanstack/react-query"
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useObterIncidentes } from "@/backend/api/controllers/incidente"
import { useObterProjetos } from "@/backend/api/controllers/projeto"
import { Enum } from "@/backend/api/enums/enum"
import { DashboardQueryKeys } from "@/backend/api/models/dashboard.types"
import { GitHubQueryKeys } from "@/backend/api/models/github.types"
import { IncidenteQueryKeys } from "@/backend/api/models/incidente.types"
import { ProjetoQueryKeys } from "@/backend/api/models/projeto.types"
import { RailwayQueryKeys } from "@/backend/api/models/railway.types"
import { SupabaseQueryKeys } from "@/backend/api/models/supabase.types"
import { VercelQueryKeys } from "@/backend/api/models/vercel.types"
import type { ResultadoBuscaGlobal } from "@/components/TopBar/TopBar.types"
import { buscarResultadosGlobais } from "@/components/TopBar/TopBar.utils"
import { queryClient } from "@/lib/config/query-client"
import { useIntegracoes } from "@/lib/hooks/useIntegracoes"
import { formatarAgora } from "@/lib/utils/date"

const CHAVES_ATUALIZAVEIS = new Set<unknown>([
    DashboardQueryKeys.ObterDashboard,
    GitHubQueryKeys.Conexoes,
    GitHubQueryKeys.Repositorios,
    IncidenteQueryKeys.ObterIncidentes,
    ProjetoQueryKeys.ObterProjetoPorId,
    ProjetoQueryKeys.ObterProjetos,
    RailwayQueryKeys.Conexao,
    RailwayQueryKeys.Projetos,
    SupabaseQueryKeys.Conexao,
    SupabaseQueryKeys.Projetos,
    VercelQueryKeys.Conexao,
    VercelQueryKeys.Projetos,
])

const consultaAtualizavel = ({ queryKey }: { queryKey: readonly unknown[] }) =>
    CHAVES_ATUALIZAVEIS.has(queryKey[0])

const obterUltimaAtualizacao = () => {
    const timestamps = queryClient
        .getQueryCache()
        .findAll({ predicate: consultaAtualizavel })
        .map(({ state }) => state.dataUpdatedAt)
        .filter((timestamp) => timestamp > 0)

    return timestamps.length ? Math.max(...timestamps) : null
}

export const useTopBar = () => {
    const navigate = useNavigate()
    const inputBuscaRef = useRef<HTMLInputElement>(null)
    const containerBuscaRef = useRef<HTMLDivElement>(null)
    const [busca, setBusca] = useState("")
    const [painelBuscaAberto, setPainelBuscaAberto] = useState(false)
    const [indiceSelecionado, setIndiceSelecionado] = useState(0)
    const [atualizacaoIsPending, setAtualizacaoIsPending] = useState(false)
    const [ultimaAtualizacaoTimestamp, setUltimaAtualizacaoTimestamp] = useState(obterUltimaAtualizacao)

    const { data: projetos = [], isLoading: projetosIsLoading } = useObterProjetos()
    const { data: incidentes = [] } = useObterIncidentes()
    const { integracoes } = useIntegracoes()
    const consultasAtivas = useIsFetching({ predicate: consultaAtualizavel })
    const resultadosBusca = useMemo(
        () => buscarResultadosGlobais(projetos, busca),
        [busca, projetos]
    )
    const incidentesAtivos = incidentes.filter(
        ({ status }) => status !== Enum.StatusIncidente.Resolvido
    ).length

    useEffect(() => {
        if (consultasAtivas > 0) return
        setUltimaAtualizacaoTimestamp(obterUltimaAtualizacao())
    }, [consultasAtivas])

    useEffect(() => {
        const focarBusca = (evento: globalThis.KeyboardEvent) => {
            if ((evento.ctrlKey || evento.metaKey) && evento.key.toLocaleLowerCase() === "k") {
                evento.preventDefault()
                inputBuscaRef.current?.focus()
                setPainelBuscaAberto(Boolean(inputBuscaRef.current?.value.trim()))
            }
        }
        const fecharAoClicarFora = (evento: PointerEvent) => {
            if (!containerBuscaRef.current?.contains(evento.target as Node)) {
                setPainelBuscaAberto(false)
            }
        }

        document.addEventListener("keydown", focarBusca)
        document.addEventListener("pointerdown", fecharAoClicarFora)
        return () => {
            document.removeEventListener("keydown", focarBusca)
            document.removeEventListener("pointerdown", fecharAoClicarFora)
        }
    }, [])

    useEffect(() => {
        setIndiceSelecionado(0)
    }, [resultadosBusca])

    const alterarBusca = (valor: string) => {
        setBusca(valor)
        setPainelBuscaAberto(Boolean(valor.trim()))
    }

    const selecionarResultado = (resultado: ResultadoBuscaGlobal) => {
        setBusca("")
        setPainelBuscaAberto(false)
        navigate(resultado.destino)
    }

    const controlarTecladoBusca = (evento: KeyboardEvent<HTMLInputElement>) => {
        if (evento.key === "Escape") {
            setPainelBuscaAberto(false)
            inputBuscaRef.current?.blur()
            return
        }
        if (!painelBuscaAberto || resultadosBusca.length === 0) return
        if (evento.key === "ArrowDown") {
            evento.preventDefault()
            setIndiceSelecionado((indice) => (indice + 1) % resultadosBusca.length)
        }
        if (evento.key === "ArrowUp") {
            evento.preventDefault()
            setIndiceSelecionado(
                (indice) => (indice - 1 + resultadosBusca.length) % resultadosBusca.length
            )
        }
        if (evento.key === "Enter") {
            evento.preventDefault()
            selecionarResultado(resultadosBusca[indiceSelecionado])
        }
    }

    const atualizarTudo = () => {
        if (atualizacaoIsPending) return
        setAtualizacaoIsPending(true)
        const atualizacao = queryClient
            .refetchQueries(
                { predicate: consultaAtualizavel, type: "active" },
                { throwOnError: true }
            )
            .then(() => setUltimaAtualizacaoTimestamp(obterUltimaAtualizacao()))
            .finally(() => setAtualizacaoIsPending(false))

        toast.promise(atualizacao, {
            id: "atualizar-todos-os-dados",
            loading: "Atualizando dados...",
            success: "Dados atualizados.",
            error: "Não foi possível atualizar todos os dados.",
        })
    }

    return {
        busca,
        painelBuscaAberto,
        indiceSelecionado,
        resultadosBusca,
        projetosIsLoading,
        inputBuscaRef,
        containerBuscaRef,
        ultimaAtualizacao: ultimaAtualizacaoTimestamp
            ? formatarAgora(new Date(ultimaAtualizacaoTimestamp))
            : "Ainda não atualizado",
        atualizacaoIsPending,
        integracoes,
        incidentesAtivos,
        alterarBusca,
        abrirPainelBusca: () => setPainelBuscaAberto(Boolean(busca.trim())),
        controlarTecladoBusca,
        selecionarResultado,
        abrirIncidentes: () => navigate("/incidentes"),
        atualizarTudo,
    }
}
