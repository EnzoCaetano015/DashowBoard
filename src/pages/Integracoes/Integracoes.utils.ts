import { Enum } from "@/backend/api/enums/enum"
import type { ConexaoGitHub } from "@/backend/api/models/github.types"
import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"
import type { ConexaoSupabase, ObterProjetosSupabase } from "@/backend/api/models/supabase.types"
import type { ConexaoVercel } from "@/backend/api/models/vercel.types"
import { formatarDataHora } from "@/lib/utils/date"
import { normalizarErroGitHub } from "@/lib/utils/github"
import { normalizarErroSupabase } from "@/lib/utils/supabase"
import { normalizarErroVercel } from "@/lib/utils/vercel"

type EstadoConsulta = {
    runtimeDisponivel: boolean
    isLoading: boolean
    isError: boolean
    error: unknown
}

const integracaoDesktop = (provider: Enum.Provider): ObterIntegracoes.Integracao => ({
    provider,
    conta: "Disponível no aplicativo desktop",
    status: Enum.StatusIntegracao.Desconectado,
    ultimaSincronizacao: "Não disponível",
})

export const montarIntegracaoGitHub = (
    connections: ConexaoGitHub[],
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.GitHub)
    if (consulta.isError) {
        return {
            provider: Enum.Provider.GitHub,
            conta: "Não foi possível consultar as conexões",
            status: Enum.StatusIntegracao.Erro,
            erro: normalizarErroGitHub(consulta.error).message,
            ultimaSincronizacao: "Não disponível",
        }
    }
    if (consulta.isLoading) {
        return {
            provider: Enum.Provider.GitHub,
            conta: "Consultando conexões...",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: "Não disponível",
        }
    }

    const validas = connections.filter(
        (connection) => connection.status === Enum.StatusIntegracao.Conectado
    )
    const comErro = connections.filter((connection) => connection.status === Enum.StatusIntegracao.Erro)
    const ultimaSincronizacao = connections.reduce<string | undefined>(
        (latest, connection) =>
            !latest || connection.ultimaSincronizacao > latest ? connection.ultimaSincronizacao : latest,
        undefined
    )

    return {
        provider: Enum.Provider.GitHub,
        conta:
            connections.length === 0
                ? "Nenhuma conexão configurada"
                : `${connections.length} conex${connections.length === 1 ? "ão" : "ões"} · ${validas.length} válida${validas.length === 1 ? "" : "s"}`,
        status:
            comErro.length > 0
                ? Enum.StatusIntegracao.Erro
                : validas.length > 0
                  ? Enum.StatusIntegracao.Conectado
                  : Enum.StatusIntegracao.Desconectado,
        erro:
            comErro.length > 0
                ? `${comErro.length} conexão(ões) precisa(m) de atenção. As demais continuam disponíveis.`
                : undefined,
        ultimaSincronizacao: ultimaSincronizacao ? formatarDataHora(ultimaSincronizacao) : "Nunca",
    }
}

export const montarIntegracaoVercel = (
    connection: ConexaoVercel | null,
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Vercel)
    if (consulta.isError) {
        return {
            provider: Enum.Provider.Vercel,
            conta: "Não foi possível consultar a conexão",
            status: Enum.StatusIntegracao.Erro,
            erro: normalizarErroVercel(consulta.error).message,
            ultimaSincronizacao: "Não disponível",
        }
    }
    if (!connection) {
        return {
            provider: Enum.Provider.Vercel,
            conta: consulta.isLoading ? "Consultando conexão..." : "Nenhuma conexão configurada",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Não disponível" : "Nunca",
        }
    }
    return {
        provider: Enum.Provider.Vercel,
        conta: `@${connection.username} · ${connection.quantidadeTimes} time(s) · ${connection.quantidadeProjetos} projeto(s)`,
        status: connection.status,
        erro: connection.erro ?? undefined,
        ultimaSincronizacao: formatarDataHora(connection.ultimaSincronizacao),
    }
}

export const montarIntegracaoSupabase = (
    connection: ConexaoSupabase | null,
    projetos: ObterProjetosSupabase.Response | undefined,
    consultaConexao: EstadoConsulta,
    consultaProjetos: Pick<EstadoConsulta, "isError" | "error">
): ObterIntegracoes.Integracao => {
    if (!consultaConexao.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Supabase)
    const error = consultaConexao.isError
        ? normalizarErroSupabase(consultaConexao.error)
        : consultaProjetos.isError
          ? normalizarErroSupabase(consultaProjetos.error)
          : null
    if (error) {
        return {
            provider: Enum.Provider.Supabase,
            conta: connection ? `@${connection.username} · ${connection.email}` : "Falha na conexão",
            status: Enum.StatusIntegracao.Erro,
            erro: error.message,
            ultimaSincronizacao: connection
                ? formatarDataHora(connection.ultimaSincronizacao)
                : "Não disponível",
        }
    }
    if (!connection) {
        return {
            provider: Enum.Provider.Supabase,
            conta: consultaConexao.isLoading ? "Consultando conexão..." : "Nenhuma conexão configurada",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consultaConexao.isLoading ? "Não disponível" : "Nunca",
        }
    }

    const falha = projetos?.failures[0]
    return {
        provider: Enum.Provider.Supabase,
        conta: `@${connection.username} · ${connection.quantidadeOrganizacoes} organização(ões) · ${projetos?.projects.length ?? connection.quantidadeProjetos} projeto(s)`,
        status:
            falha || connection.status === Enum.StatusIntegracao.Erro
                ? Enum.StatusIntegracao.Erro
                : Enum.StatusIntegracao.Conectado,
        erro: falha ? `${falha.organizacaoNome}: ${falha.message}` : (connection.erro ?? undefined),
        ultimaSincronizacao: formatarDataHora(connection.ultimaSincronizacao),
    }
}
