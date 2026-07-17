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
}

const integracaoDesktop = (provider: Enum.Provider): ObterIntegracoes.Integracao => ({
    provider,
    conta: "Disponível no aplicativo desktop",
    status: Enum.StatusIntegracao.Desconectado,
    ultimaSincronizacao: "Não disponível",
})

export const montarIntegracaoGitHub = (
    conexoes: ConexaoGitHub[],
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.GitHub)
    if (consulta.isLoading) {
        return {
            provider: Enum.Provider.GitHub,
            conta: "Consultando conexões...",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: "Não disponível",
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
                ? "Nenhuma conexão configurada"
                : `${conexoes.length} conex${conexoes.length === 1 ? "ão" : "ões"} · ${validas.length} válida${validas.length === 1 ? "" : "s"}`,
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
    conexao: ConexaoVercel | null,
    consulta: EstadoConsulta
): ObterIntegracoes.Integracao => {
    if (!consulta.runtimeDisponivel) return integracaoDesktop(Enum.Provider.Vercel)
    if (!conexao) {
        return {
            provider: Enum.Provider.Vercel,
            conta: consulta.isLoading ? "Consultando conexão..." : "Nenhuma conexão configurada",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Não disponível" : "Nunca",
        }
    }
    return {
        provider: Enum.Provider.Vercel,
        conta: `@${conexao.username} · ${conexao.quantidadeTimes} time(s) · ${conexao.quantidadeProjetos} projeto(s)`,
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
    if (!conexao) {
        return {
            provider: Enum.Provider.Supabase,
            conta: consulta.isLoading ? "Consultando conexão..." : "Nenhuma conexão configurada",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Não disponível" : "Nunca",
        }
    }

    const falha = projetos?.failures[0]
    return {
        provider: Enum.Provider.Supabase,
        conta: `@${conexao.username} · ${conexao.quantidadeOrganizacoes} organização(ões) · ${projetos?.projects.length ?? conexao.quantidadeProjetos} projeto(s)`,
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
    if (!conexao) {
        return {
            provider: Enum.Provider.Railway,
            conta: consulta.isLoading ? "Consultando conexão..." : "Nenhuma conexão configurada",
            status: Enum.StatusIntegracao.Desconectado,
            ultimaSincronizacao: consulta.isLoading ? "Não disponível" : "Nunca",
        }
    }
    return {
        provider: Enum.Provider.Railway,
        conta: `${conexao.email} · ${conexao.quantidadeWorkspaces} workspace(s) · ${conexao.quantidadeProjetos} projeto(s)`,
        status: conexao.status,
        erro: conexao.erro ?? undefined,
        ultimaSincronizacao: formatarDataHora(conexao.ultimaSincronizacao),
    }
}
