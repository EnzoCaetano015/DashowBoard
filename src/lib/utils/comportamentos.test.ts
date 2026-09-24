import { describe, expect, it } from "vitest"

import { Enum } from "@/backend/api/enums/enum"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { inferirTagRepositorio } from "@/components/NovoProjeto/NovoProjeto.utils"
import { buscarResultadosGlobais } from "@/components/TopBar/TopBar.utils"
import { FILTROS_HOME_INICIAIS, filtrarProjetos, ordenarProjetos } from "@/pages/Home/Home.utils"
import {
    FILTROS_INCIDENTES_INICIAIS,
    filtrarIncidentes,
} from "@/pages/Incidentes/Incidentes.utils"

const criarProjeto = (
    id: string,
    nome: string,
    status: Enum.StatusProjeto,
    ultimaVerificacao: string | null
): ObterProjetos.Projeto => ({
    id,
    nome,
    descricao: "Aplicação de catálogo",
    status,
    ultimaVerificacao,
    providers: [],
    repositorios: [],
    servicos: [],
    deployments: [],
    incidentes: [],
    historicoStatus: [],
    historicoVerificacoesUrl: [],
    ultimaVerificacaoUrl: null,
    disponibilidade: [],
    tempoResposta: [],
    intervaloVerificacaoSegundos: 300,
    timeoutSegundos: 5,
    notificacoesAtivas: true,
    coletarDeployments: true,
})

const criarRepositorio = (nome: string, language: string | null, topics: string[]) =>
    ({
        id: 1,
        nodeId: "node",
        nome,
        fullName: `org/${nome}`,
        ownerLogin: "org",
        ownerAvatarUrl: "https://example.com/avatar.png",
        description: null,
        private: false,
        fork: false,
        archived: false,
        htmlUrl: `https://github.com/org/${nome}`,
        defaultBranch: "main",
        language,
        topics,
        updatedAt: "2026-01-01T00:00:00.000Z",
        pushedAt: null,
        connectionId: "connection",
        connectionName: "GitHub",
    }) satisfies RepositorioGitHub

const criarIncidente = (
    id: string,
    status: Enum.StatusIncidente,
    iniciadoEm: string
): ObterIncidentes.Incidente => ({
    id,
    projetoId: "projeto",
    projetoNome: "Catálogo",
    titulo: "Falha na API",
    descricao: null,
    servicoId: "servico",
    servico: "API",
    provider: Enum.Provider.Railway,
    origem: Enum.OrigemIncidente.Servico,
    notificacoesAtivas: true,
    status,
    severidade: Enum.SeveridadeIncidente.Alta,
    iniciadoEm,
    duracaoMinutos: 0,
    resolvidoEm: status === Enum.StatusIncidente.Resolvido ? iniciadoEm : null,
})

describe("comportamentos de busca e ordenação", () => {
    it("normaliza acentos na busca global e na Home", () => {
        const projeto = criarProjeto("1", "Catálogo", Enum.StatusProjeto.Saudavel, null)
        expect(buscarResultadosGlobais([projeto], "catalogo")).toHaveLength(1)
        expect(
            filtrarProjetos([projeto], { ...FILTROS_HOME_INICIAIS, busca: "catalogo" })
        ).toHaveLength(1)
    })

    it("ordena por criticidade e mantém projetos sem data no fim", () => {
        const saudavel = criarProjeto("1", "B", Enum.StatusProjeto.Saudavel, null)
        const offline = criarProjeto(
            "2",
            "A",
            Enum.StatusProjeto.Offline,
            "2026-01-01T00:00:00.000Z"
        )
        expect(ordenarProjetos([saudavel, offline], "criticidade")[0]?.id).toBe("2")
        const porVerificacao = ordenarProjetos([saudavel, offline], "verificacao")
        expect(porVerificacao[porVerificacao.length - 1]?.id).toBe("1")
    })

    it("mantém incidentes ativos antes dos resolvidos e ordena por data", () => {
        const recenteResolvido = criarIncidente(
            "resolvido",
            Enum.StatusIncidente.Resolvido,
            new Date().toISOString()
        )
        const ativo = criarIncidente(
            "ativo",
            Enum.StatusIncidente.EmAndamento,
            new Date(Date.now() - 60_000).toISOString()
        )
        expect(
            filtrarIncidentes([recenteResolvido, ativo], FILTROS_INCIDENTES_INICIAIS)[0]?.id
        ).toBe("ativo")
    })
})

describe("inferência de tags", () => {
    it.each([
        ["docs", null, ["documentation"], Enum.TagRepositorio.Documentacao],
        ["infra", "HCL", [], Enum.TagRepositorio.Infraestrutura],
        ["backend-api", "TypeScript", [], Enum.TagRepositorio.Api],
        ["queue-worker", "Go", [], Enum.TagRepositorio.Worker],
        ["frontend", "TypeScript", ["react"], Enum.TagRepositorio.Frontend],
        ["shared-sdk", "TypeScript", [], Enum.TagRepositorio.Biblioteca],
        ["sem-sinal", null, [], Enum.TagRepositorio.Biblioteca],
    ])("infere %s", (nome, linguagem, topicos, esperado) => {
        expect(inferirTagRepositorio(criarRepositorio(nome, linguagem, topicos))).toBe(esperado)
    })
})
