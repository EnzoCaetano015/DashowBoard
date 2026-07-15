import { Enum } from "@/backend/api/enums/enum"
import type { ObterDashboard } from "@/backend/api/models/dashboard.types"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"
import type { ObterProjetoPorId, ObterProjetos } from "@/backend/api/models/projeto.types"

const latencia = 280

const aguardar = () => new Promise<void>((resolve) => window.setTimeout(resolve, latencia))

const projetos: ObterProjetos.Projeto[] = [
    {
        id: "easy-rifas",
        nome: "Easy Rifas",
        descricao: "Plataforma para criação, gestão e acompanhamento de rifas online.",
        status: Enum.StatusProjeto.Saudavel,
        ultimaVerificacao: "há 28 s",
        providers: [
            Enum.Provider.GitHub,
            Enum.Provider.Vercel,
            Enum.Provider.Railway,
            Enum.Provider.Supabase,
        ],
        urlAplicacao: "https://easyrifas.com.br",
        intervaloVerificacaoSegundos: 30,
        timeoutSegundos: 5,
        notificacoesAtivas: true,
        coletarDeployments: true,
        repositorios: [
            {
                id: "er-front",
                nome: "easyrifas/plataforma-front",
                descricao: "Aplicação web React para organizadores e participantes.",
                branch: "main",
                tags: [Enum.TagRepositorio.Frontend],
                ultimoCommit: {
                    sha: "c84f29a",
                    mensagem: "feat: melhora painel de campanhas",
                    autor: "Caetano",
                    data: "há 2 h",
                },
                statusWorkflow: Enum.StatusWorkflow.Sucesso,
                issuesAbertas: 3,
                pullRequestsAbertas: 1,
                url: "https://github.com/easyrifas/plataforma-front",
            },
            {
                id: "er-api",
                nome: "easyrifas/plataforma-back",
                descricao: "API ASP.NET Core responsável pelo domínio e integrações de pagamento.",
                branch: "main",
                tags: [Enum.TagRepositorio.Api, Enum.TagRepositorio.Infraestrutura],
                ultimoCommit: {
                    sha: "4e71bd9",
                    mensagem: "fix: valida webhook de pagamento",
                    autor: "Caetano",
                    data: "há 5 h",
                },
                statusWorkflow: Enum.StatusWorkflow.EmAndamento,
                issuesAbertas: 5,
                pullRequestsAbertas: 2,
                url: "https://github.com/easyrifas/plataforma-back",
            },
        ],
        servicos: [
            {
                id: "er-web",
                nome: "easyrifas-web",
                provider: Enum.Provider.Vercel,
                tipo: Enum.TipoServico.Frontend,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "há 2 h",
                tempoRespostaMs: 118,
                ultimaVerificacao: "há 28 s",
                urlExterna: "https://vercel.com",
                critico: true,
            },
            {
                id: "er-api",
                nome: "easyrifas-api",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Api,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "há 5 h",
                tempoRespostaMs: 164,
                ultimaVerificacao: "há 25 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Easy Rifas Produção",
                critico: true,
            },
            {
                id: "er-worker",
                nome: "payment-worker",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Worker,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "ontem",
                tempoRespostaMs: 92,
                ultimaVerificacao: "há 31 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Easy Rifas Produção",
                critico: false,
            },
            {
                id: "er-db",
                nome: "postgres-primary",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.BancoDados,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "—",
                tempoRespostaMs: 37,
                ultimaVerificacao: "há 24 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Easy Rifas Produção",
                critico: true,
            },
            {
                id: "er-supabase",
                nome: "analytics-db",
                provider: Enum.Provider.Supabase,
                tipo: Enum.TipoServico.BancoDados,
                ambiente: "sa-east-1",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "—",
                tempoRespostaMs: 63,
                ultimaVerificacao: "há 22 s",
                urlExterna: "https://supabase.com",
                critico: false,
            },
        ],
        deployments: [
            {
                id: "erd1",
                provider: Enum.Provider.Vercel,
                servico: "easyrifas-web",
                status: Enum.StatusDeployment.Sucesso,
                commit: "c84f29a",
                autor: "Caetano",
                data: "hoje, 20:42",
            },
            {
                id: "erd2",
                provider: Enum.Provider.Railway,
                servico: "easyrifas-api",
                status: Enum.StatusDeployment.Sucesso,
                commit: "4e71bd9",
                autor: "Caetano",
                data: "hoje, 17:15",
            },
        ],
        incidentes: [
            {
                id: "eri1",
                projetoId: "easy-rifas",
                projetoNome: "Easy Rifas",
                titulo: "Latência elevada na API",
                servico: "easyrifas-api",
                status: Enum.StatusIncidente.Resolvido,
                severidade: Enum.SeveridadeIncidente.Media,
                iniciadoEm: "10 jul, 14:28",
                duracaoMinutos: 18,
            },
        ],
        disponibilidade: [
            99.91, 99.95, 99.98, 99.97, 100, 100, 99.99, 99.96, 99.98, 100, 100, 99.94, 99.97, 100,
            99.99, 99.98, 100, 100, 99.96, 99.98, 100, 99.99, 100, 100, 99.97, 99.99, 100, 100, 99.98,
            100,
        ],
        tempoResposta: [
            132, 128, 141, 124, 119, 117, 123, 138, 126, 121, 118, 134, 127, 116, 114, 123, 119, 125,
            131, 117, 113, 122, 126, 120, 118, 115, 124, 121, 119, 118,
        ],
    },
    {
        id: "proteo",
        nome: "Proteo",
        descricao: "Ecossistema de análise proteômica com processamento assíncrono de datasets.",
        status: Enum.StatusProjeto.Degradado,
        ultimaVerificacao: "há 41 s",
        providers: [Enum.Provider.GitHub, Enum.Provider.Vercel, Enum.Provider.Railway],
        urlAplicacao: "https://proteo.app",
        intervaloVerificacaoSegundos: 30,
        timeoutSegundos: 10,
        notificacoesAtivas: true,
        coletarDeployments: true,
        repositorios: [
            {
                id: "pr-web",
                nome: "proteo/dashboard",
                descricao: "Dashboard analítico para acompanhamento de experimentos.",
                branch: "main",
                tags: [Enum.TagRepositorio.Frontend],
                ultimoCommit: {
                    sha: "a13dc5e",
                    mensagem: "feat: adiciona matriz de correlação",
                    autor: "Caetano",
                    data: "há 1 dia",
                },
                statusWorkflow: Enum.StatusWorkflow.Falha,
                issuesAbertas: 8,
                pullRequestsAbertas: 2,
                url: "https://github.com/proteo/dashboard",
            },
            {
                id: "pr-worker",
                nome: "proteo/pipeline-worker",
                descricao: "Worker de processamento e normalização de amostras.",
                branch: "main",
                tags: [Enum.TagRepositorio.Worker, Enum.TagRepositorio.Biblioteca],
                ultimoCommit: {
                    sha: "8f31b09",
                    mensagem: "perf: reduz uso de memória no pipeline",
                    autor: "Caetano",
                    data: "há 2 dias",
                },
                statusWorkflow: Enum.StatusWorkflow.Sucesso,
                issuesAbertas: 2,
                pullRequestsAbertas: 0,
                url: "https://github.com/proteo/pipeline-worker",
            },
        ],
        servicos: [
            {
                id: "pr-web",
                nome: "proteo-dashboard",
                provider: Enum.Provider.Vercel,
                tipo: Enum.TipoServico.Frontend,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "há 1 dia",
                tempoRespostaMs: 146,
                ultimaVerificacao: "há 39 s",
                urlExterna: "https://vercel.com",
                critico: true,
            },
            {
                id: "pr-api",
                nome: "proteo-api",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Api,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "há 2 dias",
                tempoRespostaMs: 231,
                ultimaVerificacao: "há 37 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Proteo Core",
                critico: true,
            },
            {
                id: "pr-worker",
                nome: "pipeline-worker",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Worker,
                ambiente: "production",
                status: Enum.StatusProjeto.Offline,
                ultimoDeployment: "há 2 dias",
                tempoRespostaMs: 0,
                ultimaVerificacao: "há 41 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Proteo Core",
                critico: true,
            },
            {
                id: "pr-redis",
                nome: "job-cache",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Cache,
                ambiente: "production",
                status: Enum.StatusProjeto.Saudavel,
                ultimoDeployment: "—",
                tempoRespostaMs: 16,
                ultimaVerificacao: "há 35 s",
                urlExterna: "https://railway.app",
                projetoRailway: "Proteo Data",
                critico: false,
            },
        ],
        deployments: [
            {
                id: "prd1",
                provider: Enum.Provider.Railway,
                servico: "pipeline-worker",
                status: Enum.StatusDeployment.Falha,
                commit: "8f31b09",
                autor: "Caetano",
                data: "hoje, 21:08",
            },
            {
                id: "prd2",
                provider: Enum.Provider.Vercel,
                servico: "proteo-dashboard",
                status: Enum.StatusDeployment.Sucesso,
                commit: "a13dc5e",
                autor: "Caetano",
                data: "ontem, 18:02",
            },
        ],
        incidentes: [
            {
                id: "pri1",
                projetoId: "proteo",
                projetoNome: "Proteo",
                titulo: "Worker sem responder",
                servico: "pipeline-worker",
                status: Enum.StatusIncidente.EmAndamento,
                severidade: Enum.SeveridadeIncidente.Alta,
                iniciadoEm: "hoje, 21:10",
                duracaoMinutos: 54,
            },
            {
                id: "pri2",
                projetoId: "proteo",
                projetoNome: "Proteo",
                titulo: "Fila acumulando jobs",
                servico: "pipeline-worker",
                status: Enum.StatusIncidente.Monitorando,
                severidade: Enum.SeveridadeIncidente.Media,
                iniciadoEm: "ontem, 16:20",
                duracaoMinutos: 81,
            },
        ],
        disponibilidade: [
            99.8, 99.7, 99.9, 99.6, 99.8, 99.2, 98.9, 99.4, 99.7, 99.8, 99.5, 99.6, 99.8, 99.1, 98.6,
            99.2, 99.4, 99.7, 99.8, 99.6, 99.5, 99.7, 99.4, 98.8, 99.1, 99.5, 99.2, 98.9, 97.8, 96.4,
        ],
        tempoResposta: [
            184, 176, 193, 201, 189, 220, 245, 213, 197, 185, 191, 204, 188, 236, 271, 248, 229, 205,
            196, 208, 214, 203, 219, 257, 241, 226, 238, 264, 301, 342,
        ],
    },
    {
        id: "farmtech",
        nome: "FarmTech",
        descricao: "Monitoramento agrícola e telemetria de campo para operações conectadas.",
        status: Enum.StatusProjeto.Desconhecido,
        ultimaVerificacao: "há 12 min",
        providers: [Enum.Provider.GitHub, Enum.Provider.Supabase, Enum.Provider.Railway],
        intervaloVerificacaoSegundos: 60,
        timeoutSegundos: 5,
        notificacoesAtivas: false,
        coletarDeployments: true,
        repositorios: [
            {
                id: "ft-api",
                nome: "farmtech/iot-api",
                descricao: "API e ingestão de dados dos sensores de campo.",
                branch: "develop",
                tags: [Enum.TagRepositorio.Api, Enum.TagRepositorio.Infraestrutura],
                ultimoCommit: {
                    sha: "e92a771",
                    mensagem: "chore: atualiza contratos de telemetria",
                    autor: "Caetano",
                    data: "há 4 dias",
                },
                statusWorkflow: Enum.StatusWorkflow.Desconhecido,
                issuesAbertas: 1,
                pullRequestsAbertas: 1,
                url: "https://github.com/farmtech/iot-api",
            },
        ],
        servicos: [
            {
                id: "ft-api",
                nome: "telemetry-api",
                provider: Enum.Provider.Railway,
                tipo: Enum.TipoServico.Api,
                ambiente: "staging",
                status: Enum.StatusProjeto.Desconhecido,
                ultimoDeployment: "há 4 dias",
                tempoRespostaMs: 0,
                ultimaVerificacao: "há 12 min",
                urlExterna: "https://railway.app",
                projetoRailway: "FarmTech Staging",
                critico: true,
            },
            {
                id: "ft-db",
                nome: "farmtech-data",
                provider: Enum.Provider.Supabase,
                tipo: Enum.TipoServico.BancoDados,
                ambiente: "sa-east-1",
                status: Enum.StatusProjeto.Desconhecido,
                ultimoDeployment: "—",
                tempoRespostaMs: 0,
                ultimaVerificacao: "pausado",
                urlExterna: "https://supabase.com",
                critico: true,
            },
        ],
        deployments: [
            {
                id: "ftd1",
                provider: Enum.Provider.Railway,
                servico: "telemetry-api",
                status: Enum.StatusDeployment.EmAndamento,
                commit: "e92a771",
                autor: "Caetano",
                data: "há 4 dias",
            },
        ],
        incidentes: [
            {
                id: "fti1",
                projetoId: "farmtech",
                projetoNome: "FarmTech",
                titulo: "Token Supabase inválido",
                servico: "farmtech-data",
                status: Enum.StatusIncidente.Monitorando,
                severidade: Enum.SeveridadeIncidente.Baixa,
                iniciadoEm: "08 jul, 09:12",
                duracaoMinutos: 320,
            },
        ],
        disponibilidade: [
            99.2, 99.4, 99.3, 99.6, 99.5, 99.4, 99.1, 99.3, 99.5, 99.2, 99.4, 99.6, 99.5, 99.1, 99.2,
            99.4, 99.3, 99.5, 99.2, 99.4, 99.1, 98.9, 99.2, 99.3, 99.1, 98.8, 98.7, 98.5, 98.4, 98.2,
        ],
        tempoResposta: [
            240, 235, 248, 229, 251, 246, 262, 254, 239, 271, 258, 243, 252, 266, 279, 261, 247, 253,
            268, 281, 276, 294, 288, 301, 315, 307, 322, 338, 351, 360,
        ],
    },
]

const integracoes: ObterIntegracoes.Integracao[] = [
    {
        provider: Enum.Provider.Vercel,
        conta: "Integração ainda não implementada",
        status: Enum.StatusIntegracao.EmBreve,
        ultimaSincronizacao: "Não disponível",
    },
    {
        provider: Enum.Provider.Railway,
        conta: "Integração ainda não implementada",
        status: Enum.StatusIntegracao.EmBreve,
        ultimaSincronizacao: "Não disponível",
    },
    {
        provider: Enum.Provider.Supabase,
        conta: "Integração ainda não implementada",
        status: Enum.StatusIntegracao.EmBreve,
        ultimaSincronizacao: "Não disponível",
    },
]

const clonar = <T>(valor: T): T => structuredClone(valor)

export const obterProjetosMock = async (): Promise<ObterProjetos.Response> => {
    await aguardar()
    return clonar(projetos)
}

export const obterProjetoPorIdMock = async (
    request: ObterProjetoPorId.Request,
): Promise<ObterProjetoPorId.Response> => {
    await aguardar()
    return clonar(projetos.find((projeto) => projeto.id === request.id))
}

export const obterIncidentesMock = async (): Promise<ObterIncidentes.Response> => {
    await aguardar()
    return clonar(projetos.flatMap((projeto) => projeto.incidentes))
}

export const obterIntegracoesMock = async (): Promise<ObterIntegracoes.Response> => {
    await aguardar()
    return clonar(integracoes)
}

export const obterDashboardMock = async (
    request: ObterDashboard.Request,
): Promise<ObterDashboard.Response> => {
    await aguardar()
    const incidentes = projetos.flatMap((projeto) => projeto.incidentes).slice(0, request.periodo)

    return clonar({
        projetos,
        metricas: {
            totalProjetos: projetos.length,
            saudaveis: projetos.filter((projeto) => projeto.status === Enum.StatusProjeto.Saudavel)
                .length,
            degradados: projetos.filter((projeto) => projeto.status === Enum.StatusProjeto.Degradado)
                .length,
            offline: projetos.filter((projeto) => projeto.status === Enum.StatusProjeto.Offline).length,
            servicosMonitorados: projetos.reduce((total, projeto) => total + projeto.servicos.length, 0),
            incidentes: incidentes.length,
            tendencias: {
                projetos: [1, 1, 2, 2, 2, 3, 3],
                saudaveis: [1, 2, 2, 1, 2, 1, 1],
                degradados: [0, 0, 1, 1, 0, 1, 1],
                offline: [0, 0, 0, 1, 0, 0, 0],
                servicos: [4, 6, 7, 8, 9, 10, 11],
                incidentes: [0, 1, 0, 2, 1, 3, incidentes.length],
            },
        },
    })
}
