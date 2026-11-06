import { Enum } from "@/backend/api/enums/enum"
import type { ConexaoGitHub } from "@/backend/api/models/github.types"
import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"
import type { ConexaoRailway } from "@/backend/api/models/railway.types"
import type { ConexaoSupabase, ObterProjetosSupabase } from "@/backend/api/models/supabase.types"
import type { ConexaoVercel } from "@/backend/api/models/vercel.types"
import { formatarDataHora } from "@/lib/utils/date"

type EstadoConsulta = {
    runtimeDisponivel: boolean
    isLoading: boolean
    erro?: string
}

const integracaoDesktop = (provider: Enum.Provider): ObterIntegracoes.Integracao => ({
    provider,
    conta: "Available in the desktop app",
    status: Enum.StatusIntegracao.Desconectado,
    ultimaSincronizacao: "Not available",
})

export const montarIntegracaoGitHub = (
    conexoes: ConexaoGitHub[],
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.GitHub)
    if (consulta.erro) {
        return {
            provider: Enum.Provider.GitHub,
            conta: "Unable to load connections",
            status: Enum.StatusIntegracao.Erro,
            erro: consulta.erro,
            ultimaSincronizacao: "Not available",
        }
    }
    if (consulta.isLoading) {
        return {
            provider: Enum.Provider.GitHub,
            conta: "Loading connections...",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: "Not available",
        }
    }

    const validas = conexoes.filter(({ status }) => status === Enum.StatusIntegracao.Conectado)
    const comErro = conexoes.filter(({ status }) => status === Enum.StatusIntegracao.Erro)
    const ultimaSincronizacao = conexoes.reduce<string | undefined>(
        (ultima, conexao) =>
            !ultima || conexao.ultimaSincronizacao > ultima ? conexao.ultimaSincronizacao : ultima,
        undefined
    )

    return {
        provider: Enum.Provider.GitHub,
        conta:
            conexoes.length === 0
                ? "No connection configured"
                : `${conexoes.length} connection${conexoes.length === 1 ? "" : "s"} · ${validas.length} valid`,
        status:
            comErro.length > 0
                ? Enum.StatusIntegracao.Erro
                : validas.length > 0
                  ? Enum.StatusIntegracao.Conectado
                  : Enum.StatusIntegracao.Desconectado,
        erro:
            comErro.length > 0
                ? `${comErro.length} connection(s) need attention. Other connections remain available.`
                : undefined,
        ultimaSincronizacao: ultimaSincronizacao ? formatarDataHora(ultimaSincronizacao) : "Never",
    }
}

export const montarIntegracaoVercel = (
    conexao: ConexaoVercel | null,
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Vercel)
    if (consulta.erro) {
        return {
            provider: Enum.Provider.Vercel,
            conta: "Unable to load connection",
            status: Enum.StatusIntegracao.Erro,
            erro: consulta.erro,
            ultimaSincronizacao: "Not available",
        }
    }
    if (!conexao) {
        return {
            provider: Enum.Provider.Vercel,
            conta: consulta.isLoading ? "Loading connection..." : "No connection configured",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Not available" : "Never",
        }
    }
    return {
        provider: Enum.Provider.Vercel,
        conta: `@${conexao.username} · ${conexao.quantidadeTimes} team(s) · ${conexao.quantidadeProjetos} project(s)`,
        status: conexao.status,
        erro: conexao.erro ?? undefined,
        ultimaSincronizacao: formatarDataHora(conexao.ultimaSincronizacao),
    }
}

export const montarIntegracaoSupabase = (
    conexao: ConexaoSupabase | null,
    projetos: ObterProjetosSupabase.Response | undefined,
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Supabase)
    if (consulta.erro) {
        return {
            provider: Enum.Provider.Supabase,
            conta: "Unable to load connection",
            status: Enum.StatusIntegracao.Erro,
            erro: consulta.erro,
            ultimaSincronizacao: "Not available",
        }
    }
    if (!conexao) {
        return {
            provider: Enum.Provider.Supabase,
            conta: consulta.isLoading ? "Loading connection..." : "No connection configured",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Not available" : "Never",
        }
    }

    const falha = projetos?.failures[0]
    return {
        provider: Enum.Provider.Supabase,
        conta: `@${conexao.username} · ${conexao.quantidadeOrganizacoes} organization(s) · ${projetos?.projects.length ?? conexao.quantidadeProjetos} project(s)`,
        status:
            falha || conexao.status === Enum.StatusIntegracao.Erro
                ? Enum.StatusIntegracao.Erro
                : Enum.StatusIntegracao.Conectado,
        erro: falha ? `${falha.organizacaoNome}: ${falha.message}` : (conexao.erro ?? undefined),
        ultimaSincronizacao: formatarDataHora(conexao.ultimaSincronizacao),
    }
}

export const montarIntegracaoRailway = (
    conexao: ConexaoRailway | null,
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Railway)
    if (consulta.erro) {
        return {
            provider: Enum.Provider.Railway,
            conta: "Unable to load connection",
            status: Enum.StatusIntegracao.Erro,
            erro: consulta.erro,
            ultimaSincronizacao: "Not available",
        }
    }
    if (!conexao) {
        return {
            provider: Enum.Provider.Railway,
            conta: consulta.isLoading ? "Loading connection..." : "No connection configured",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Not available" : "Never",
        }
    }
    return {
        provider: Enum.Provider.Railway,
        conta: `${conexao.email} · ${conexao.quantidadeWorkspaces} workspace(s) · ${conexao.quantidadeProjetos} project(s)`,
        status: conexao.status,
        erro: conexao.erro ?? undefined,
        ultimaSincronizacao: formatarDataHora(conexao.ultimaSincronizacao),
    }
}
