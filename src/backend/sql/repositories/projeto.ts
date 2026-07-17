import { Enum } from "@/backend/api/enums/enum"
import type { ObterDashboard } from "@/backend/api/models/dashboard.types"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import type {
    AtualizarProjeto,
    CriarProjeto,
    ObterProjetoPorId,
    ObterProjetos,
    SalvarSnapshotServico,
} from "@/backend/api/models/projeto.types"
import { obterBancoDados } from "@/backend/sql/database"
import {
    abrirIncidente,
    listarIncidentes,
    listarIncidentesPorProjeto,
    resolverIncidente,
} from "@/backend/sql/repositories/incidente"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"

type ProjetoRow = {
    id: string
    nome: string
    descricao: string | null
    urlAplicacao: string | null
    status: string
    intervaloVerificacaoSegundos: number
    timeoutSegundos: number
    notificacoesAtivas: number
    coletarDeployments: number
}

type RepositorioRow = {
    id: string
    externalId: string
    connectionId: string | null
    nome: string
    fullName: string
    htmlUrl: string | null
    tag: string
    snapshotJson: string | null
}

type ServicoRow = {
    id: string
    projetoId: string
    provider: string
    externalProjectId: string
    externalEnvironmentId: string | null
    externalServiceId: string | null
    scopeId: string | null
    nome: string
    tipo: string
    critico: number
    repositorioId: string | null
    status: string
    snapshotJson: string | null
    verificadoEm: string | null
}

type StatusRow = {
    id: string
    servicoId: string
    statusAnterior: string | null
    statusAtual: string
    responseTimeMs: number | null
    verificadoEm: string
}

const lerJson = (value: string | null): unknown => {
    if (!value) return null
    try {
        return JSON.parse(value) as unknown
    } catch {
        return null
    }
}

const lerCampo = (value: unknown, campo: string): unknown => {
    return typeof value === "object" && value !== null ? Reflect.get(value, campo) : undefined
}

const lerTexto = (value: unknown, ...caminho: string[]) => {
    const resultado = caminho.reduce<unknown>((atual, campo) => lerCampo(atual, campo), value)
    return typeof resultado === "string" && resultado.trim() ? resultado : null
}

const mapearRepositorio = (row: RepositorioRow): ObterProjetos.Repositorio => {
    const snapshot = lerJson(row.snapshotJson)
    return {
        id: row.id,
        externalId: row.externalId,
        connectionId: row.connectionId,
        nome: row.nome,
        fullName: row.fullName,
        descricao: lerTexto(snapshot, "description"),
        branch: lerTexto(snapshot, "defaultBranch"),
        tags: [row.tag as Enum.TagRepositorio],
        ultimoCommit: null,
        statusWorkflow: null,
        issuesAbertas: null,
        pullRequestsAbertas: null,
        url: row.htmlUrl,
    }
}

const mapearServico = (row: ServicoRow): ObterProjetos.Servico => {
    const snapshot = lerJson(row.snapshotJson)
    const provider = row.provider as Enum.Provider
    const ultimoDeployment =
        lerTexto(snapshot, "deploymentCriadoEm") ??
        lerTexto(snapshot, "ultimoDeployment", "createdAt") ??
        null
    const urlExterna =
        lerTexto(snapshot, "productionUrl") ??
        lerTexto(snapshot, "dashboardUrl") ??
        (provider === Enum.Provider.Railway ? "https://railway.com/dashboard" : null)

    return {
        id: row.id,
        nome: row.nome,
        provider,
        tipo: row.tipo as Enum.TipoServico,
        ambiente:
            lerTexto(snapshot, "environmentName") ??
            lerTexto(snapshot, "regiao") ??
            (provider === Enum.Provider.Vercel ? "production" : "Não informado"),
        status: row.status as Enum.StatusProjeto,
        ultimoDeployment,
        deploymentStatusOriginal:
            lerTexto(snapshot, "deploymentStatusOriginal") ??
            lerTexto(snapshot, "ultimoDeployment", "estadoOriginal"),
        tempoRespostaMs: null,
        ultimaVerificacao: row.verificadoEm,
        urlExterna,
        projetoRailway: lerTexto(snapshot, "projetoNome"),
        critico: row.critico === 1,
        repositorioId: row.repositorioId,
        externalProjectId: row.externalProjectId,
        externalEnvironmentId: row.externalEnvironmentId,
        externalServiceId: row.externalServiceId,
        scopeId: row.scopeId,
    }
}

const mapearStatus = (row: StatusRow): ObterProjetos.StatusRecurso => ({
    id: row.id,
    servicoId: row.servicoId,
    statusAnterior: row.statusAnterior as Enum.StatusProjeto | null,
    statusAtual: row.statusAtual as Enum.StatusProjeto,
    responseTimeMs: row.responseTimeMs,
    verificadoEm: row.verificadoEm,
})

const selecionarProjetos = async (id?: string) => {
    const database = await obterBancoDados()
    return database.select<ProjetoRow[]>(
        `
            SELECT
                id,
                nome,
                descricao,
                url_aplicacao AS urlAplicacao,
                status,
                intervalo_verificacao_segundos AS intervaloVerificacaoSegundos,
                timeout_segundos AS timeoutSegundos,
                notificacoes_ativas AS notificacoesAtivas,
                coletar_deployments AS coletarDeployments
            FROM projetos
            WHERE ($1 IS NULL OR id = $1)
            ORDER BY atualizado_em DESC
        `,
        [id ?? null]
    )
}

const montarProjeto = async (row: ProjetoRow): Promise<ObterProjetos.Projeto> => {
    const database = await obterBancoDados()
    const [repositorios, servicos, historico, incidentes] = await Promise.all([
        database.select<RepositorioRow[]>(
            `
                SELECT
                    id,
                    external_id AS externalId,
                    connection_id AS connectionId,
                    nome,
                    full_name AS fullName,
                    html_url AS htmlUrl,
                    tag,
                    snapshot_json AS snapshotJson
                FROM projeto_repositorios
                WHERE projeto_id = $1
                ORDER BY criado_em
            `,
            [row.id]
        ),
        database.select<ServicoRow[]>(
            `
                SELECT
                    id,
                    projeto_id AS projetoId,
                    provider,
                    external_project_id AS externalProjectId,
                    external_environment_id AS externalEnvironmentId,
                    external_service_id AS externalServiceId,
                    scope_id AS scopeId,
                    nome,
                    tipo,
                    critico,
                    repositorio_id AS repositorioId,
                    status,
                    snapshot_json AS snapshotJson,
                    verificado_em AS verificadoEm
                FROM projeto_servicos
                WHERE projeto_id = $1
                ORDER BY criado_em
            `,
            [row.id]
        ),
        database.select<StatusRow[]>(
            `
                SELECT
                    id,
                    servico_id AS servicoId,
                    status_anterior AS statusAnterior,
                    status_atual AS statusAtual,
                    response_time_ms AS responseTimeMs,
                    verificado_em AS verificadoEm
                FROM status_recursos
                WHERE projeto_id = $1
                ORDER BY verificado_em
            `,
            [row.id]
        ),
        listarIncidentesPorProjeto(row.id),
    ])
    const servicosMapeados = servicos.map(mapearServico)
    const historicoMapeado = historico.map(mapearStatus)
    const verificacoes = servicos
        .map(({ verificadoEm }) => verificadoEm)
        .filter((value): value is string => Boolean(value))
        .sort()
    const ultimaVerificacao = verificacoes[verificacoes.length - 1]

    return {
        id: row.id,
        nome: row.nome,
        descricao: row.descricao ?? "",
        status: row.status as Enum.StatusProjeto,
        ultimaVerificacao: ultimaVerificacao ?? null,
        providers: Array.from(new Set(servicosMapeados.map(({ provider }) => provider))),
        repositorios: repositorios.map(mapearRepositorio),
        servicos: servicosMapeados,
        deployments: [],
        incidentes,
        historicoStatus: historicoMapeado,
        disponibilidade: historicoMapeado.flatMap(({ statusAtual }) => {
            if (statusAtual === Enum.StatusProjeto.Saudavel) return [100]
            if (statusAtual === Enum.StatusProjeto.Degradado) return [50]
            if (statusAtual === Enum.StatusProjeto.Offline) return [0]
            return []
        }),
        tempoResposta: historicoMapeado
            .map(({ responseTimeMs }) => responseTimeMs)
            .filter((value): value is number => value !== null),
        ...(row.urlAplicacao ? { urlAplicacao: row.urlAplicacao } : {}),
        intervaloVerificacaoSegundos: row.intervaloVerificacaoSegundos,
        timeoutSegundos: row.timeoutSegundos,
        notificacoesAtivas: row.notificacoesAtivas === 1,
        coletarDeployments: row.coletarDeployments === 1,
    }
}

export const listarProjetos = async (): Promise<ObterProjetos.Response> => {
    return Promise.all((await selecionarProjetos()).map(montarProjeto))
}

export const obterProjetoPorId = async (id: string): Promise<ObterProjetoPorId.Response> => {
    const [row] = await selecionarProjetos(id)
    return row ? montarProjeto(row) : undefined
}

export const criarProjeto = async (request: CriarProjeto.Request): Promise<CriarProjeto.Response> => {
    const database = await obterBancoDados()
    const projetoId = crypto.randomUUID()
    const agora = new Date().toISOString()
    const repositoriosLocais = new Map<string, string>()

    await database.execute("BEGIN IMMEDIATE")
    try {
        await database.execute(
            `
                INSERT INTO projetos (
                    id, nome, descricao, url_aplicacao, status,
                    intervalo_verificacao_segundos, timeout_segundos,
                    notificacoes_ativas, coletar_deployments, criado_em, atualizado_em
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
            `,
            [
                projetoId,
                request.nome.trim(),
                request.descricao.trim() || null,
                request.urlAplicacao?.trim() || null,
                Enum.StatusProjeto.Desconhecido,
                request.intervaloVerificacaoSegundos,
                request.timeoutSegundos,
                Number(request.notificacoesAtivas),
                Number(request.coletarDeployments),
                agora,
            ]
        )

        for (const repositorio of request.repositorios) {
            const id = crypto.randomUUID()
            repositoriosLocais.set(repositorio.externalId, id)
            await database.execute(
                `
                    INSERT INTO projeto_repositorios (
                        id, projeto_id, provider, external_id, connection_id, nome, full_name,
                        html_url, tag, snapshot_json, criado_em, atualizado_em
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
                `,
                [
                    id,
                    projetoId,
                    Enum.Provider.GitHub,
                    repositorio.externalId,
                    repositorio.connectionId,
                    repositorio.nome,
                    repositorio.fullName,
                    repositorio.htmlUrl,
                    repositorio.tag,
                    JSON.stringify(repositorio.snapshot),
                    agora,
                ]
            )
        }

        for (const servico of request.servicos) {
            await database.execute(
                `
                    INSERT INTO projeto_servicos (
                        id, projeto_id, provider, external_project_id, external_environment_id,
                        external_service_id, scope_id, nome, tipo, critico, repositorio_id, status,
                        snapshot_json, verificado_em, criado_em, atualizado_em
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NULL, $14, $14)
                `,
                [
                    crypto.randomUUID(),
                    projetoId,
                    servico.provider,
                    servico.externalProjectId,
                    servico.externalEnvironmentId,
                    servico.externalServiceId,
                    servico.scopeId,
                    servico.nome,
                    servico.tipo,
                    Number(servico.critico),
                    servico.repositorioExternalId
                        ? (repositoriosLocais.get(servico.repositorioExternalId) ?? null)
                        : null,
                    Enum.StatusProjeto.Desconhecido,
                    JSON.stringify(servico.snapshot),
                    agora,
                ]
            )
        }
        await database.execute("COMMIT")
    } catch (erro) {
        await database.execute("ROLLBACK")
        throw erro
    }

    const projeto = await obterProjetoPorId(projetoId)
    if (!projeto) throw new Error("O projeto criado não pôde ser carregado.")
    return projeto
}

export const atualizarProjeto = async (
    request: AtualizarProjeto.Request
): Promise<AtualizarProjeto.Response> => {
    const projeto = await obterProjetoPorId(request.id)
    if (!projeto) throw new Error("Projeto não encontrado.")
    const database = await obterBancoDados()
    await database.execute(
        `
            UPDATE projetos
            SET nome = $1, descricao = $2, url_aplicacao = $3,
                intervalo_verificacao_segundos = $4, timeout_segundos = $5,
                notificacoes_ativas = $6, coletar_deployments = $7, atualizado_em = $8
            WHERE id = $9
        `,
        [
            request.nome?.trim() ?? projeto.nome,
            request.descricao?.trim() ?? projeto.descricao,
            request.urlAplicacao !== undefined ? request.urlAplicacao : (projeto.urlAplicacao ?? null),
            request.intervaloVerificacaoSegundos ?? projeto.intervaloVerificacaoSegundos,
            request.timeoutSegundos ?? projeto.timeoutSegundos,
            Number(request.notificacoesAtivas ?? projeto.notificacoesAtivas),
            Number(request.coletarDeployments ?? projeto.coletarDeployments),
            new Date().toISOString(),
            request.id,
        ]
    )
    const atualizado = await obterProjetoPorId(request.id)
    if (!atualizado) throw new Error("Projeto não encontrado.")
    return atualizado
}

export const excluirProjeto = async (id: string) => {
    const database = await obterBancoDados()
    await database.execute("DELETE FROM projetos WHERE id = $1", [id])
}

export const salvarStatusRecurso = async (
    projetoId: string,
    servicoId: string,
    statusAnterior: Enum.StatusProjeto | null,
    statusAtual: Enum.StatusProjeto,
    responseTimeMs: number | null,
    verificadoEm: string
) => {
    const database = await obterBancoDados()
    await database.execute(
        `
            INSERT INTO status_recursos (
                id, projeto_id, servico_id, status_anterior, status_atual,
                response_time_ms, verificado_em
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
            crypto.randomUUID(),
            projetoId,
            servicoId,
            statusAnterior,
            statusAtual,
            responseTimeMs,
            verificadoEm,
        ]
    )
}

const agregarStatus = (statuses: Enum.StatusProjeto[]) => {
    if (statuses.length === 0) return Enum.StatusProjeto.Desconhecido
    if (statuses.some((status) => status === Enum.StatusProjeto.Desconhecido)) {
        return Enum.StatusProjeto.Desconhecido
    }
    const offline = statuses.filter((status) => status === Enum.StatusProjeto.Offline).length
    const saudaveis = statuses.filter((status) => status === Enum.StatusProjeto.Saudavel).length
    if (offline === statuses.length) return Enum.StatusProjeto.Offline
    if (offline > 0 && saudaveis > 0) return Enum.StatusProjeto.Degradado
    if (offline > 0) return Enum.StatusProjeto.Degradado
    if (statuses.some((status) => status === Enum.StatusProjeto.Degradado)) {
        return Enum.StatusProjeto.Degradado
    }
    if (statuses.some((status) => status === Enum.StatusProjeto.Atualizando)) {
        return Enum.StatusProjeto.Atualizando
    }
    return saudaveis === statuses.length ? Enum.StatusProjeto.Saudavel : Enum.StatusProjeto.Desconhecido
}

export const salvarSnapshotServico = async (request: SalvarSnapshotServico.Request) => {
    const database = await obterBancoDados()
    const [servico] = await database.select<ServicoRow[]>(
        `
            SELECT
                id,
                projeto_id AS projetoId,
                provider,
                external_project_id AS externalProjectId,
                external_environment_id AS externalEnvironmentId,
                external_service_id AS externalServiceId,
                scope_id AS scopeId,
                nome,
                tipo,
                critico,
                repositorio_id AS repositorioId,
                status,
                snapshot_json AS snapshotJson,
                verificado_em AS verificadoEm
            FROM projeto_servicos
            WHERE id = $1
        `,
        [request.servicoId]
    )
    if (!servico) return

    const agora = new Date().toISOString()
    const statusAnterior = servico.status as Enum.StatusProjeto
    const primeiraObservacao = !servico.verificadoEm
    const mudou = statusAnterior !== request.status

    await database.execute("BEGIN IMMEDIATE")
    try {
        await database.execute(
            `
                UPDATE projeto_servicos
                SET status = $1, snapshot_json = COALESCE($2, snapshot_json),
                    verificado_em = $3, atualizado_em = $3
                WHERE id = $4
            `,
            [
                request.status,
                request.snapshot === undefined ? null : JSON.stringify(request.snapshot),
                agora,
                request.servicoId,
            ]
        )
        await salvarStatusRecurso(
            servico.projetoId,
            servico.id,
            primeiraObservacao ? null : statusAnterior,
            request.status,
            request.responseTimeMs ?? null,
            agora
        )

        if (!primeiraObservacao && mudou) {
            const ficouIndisponivel =
                statusAnterior === Enum.StatusProjeto.Saudavel &&
                [Enum.StatusProjeto.Offline, Enum.StatusProjeto.Degradado].includes(request.status)
            const recuperou =
                [Enum.StatusProjeto.Offline, Enum.StatusProjeto.Degradado].includes(statusAnterior) &&
                request.status === Enum.StatusProjeto.Saudavel
            if (ficouIndisponivel) {
                await abrirIncidente({
                    projetoId: servico.projetoId,
                    servicoId: servico.id,
                    servicoNome: servico.nome,
                    status: request.status,
                })
            }
            if (recuperou) await resolverIncidente(servico.id)
        }

        const criticos = await database.select<Array<{ status: Enum.StatusProjeto }>>(
            "SELECT status FROM projeto_servicos WHERE projeto_id = $1 AND critico = 1",
            [servico.projetoId]
        )
        await database.execute("UPDATE projetos SET status = $1, atualizado_em = $2 WHERE id = $3", [
            agregarStatus(criticos.map(({ status }) => status)),
            agora,
            servico.projetoId,
        ])
        await database.execute("COMMIT")
    } catch (erro) {
        await database.execute("ROLLBACK")
        throw erro
    }
}

const construirTendenciasDashboard = (
    projetos: ObterProjetos.Projeto[],
    incidentes: ObterIncidentes.Incidente[],
    limite: number
): ObterDashboard.Metricas["tendencias"] => {
    const statusPorData = new Map<string, Map<string, Enum.StatusProjeto>>()
    const servicosPorData = new Map<string, Set<string>>()

    for (const projeto of projetos) {
        const criticos = new Set(projeto.servicos.filter(({ critico }) => critico).map(({ id }) => id))
        const observacoesPorData = new Map<string, Map<string, Enum.StatusProjeto>>()
        for (const observacao of projeto.historicoStatus) {
            if (new Date(observacao.verificadoEm).getTime() < limite) continue
            const data = observacao.verificadoEm.slice(0, 10)
            const servicosObservados = servicosPorData.get(data) ?? new Set<string>()
            servicosObservados.add(observacao.servicoId)
            servicosPorData.set(data, servicosObservados)
            if (!criticos.has(observacao.servicoId)) continue
            const statusServicos = observacoesPorData.get(data) ?? new Map()
            statusServicos.set(observacao.servicoId, observacao.statusAtual)
            observacoesPorData.set(data, statusServicos)
        }
        for (const [data, statusServicos] of observacoesPorData) {
            const projetosNaData = statusPorData.get(data) ?? new Map()
            projetosNaData.set(projeto.id, agregarStatus(Array.from(statusServicos.values())))
            statusPorData.set(data, projetosNaData)
        }
    }

    const datas = Array.from(new Set([...statusPorData.keys(), ...servicosPorData.keys()])).sort()
    if (datas.length < 2) {
        return {
            projetos: [],
            saudaveis: [],
            degradados: [],
            offline: [],
            desconhecidos: [],
            servicos: [],
            incidentesAbertos: [],
            incidentes: [],
        }
    }

    const contarStatus = (data: string, status: Enum.StatusProjeto) =>
        Array.from(statusPorData.get(data)?.values() ?? []).filter(
            (statusProjeto) => statusProjeto === status
        ).length
    return {
        projetos: datas.map((data) => statusPorData.get(data)?.size ?? 0),
        saudaveis: datas.map((data) => contarStatus(data, Enum.StatusProjeto.Saudavel)),
        degradados: datas.map((data) => contarStatus(data, Enum.StatusProjeto.Degradado)),
        offline: datas.map((data) => contarStatus(data, Enum.StatusProjeto.Offline)),
        desconhecidos: datas.map((data) => contarStatus(data, Enum.StatusProjeto.Desconhecido)),
        servicos: datas.map((data) => servicosPorData.get(data)?.size ?? 0),
        incidentesAbertos: datas.map((data) => {
            const fimData = new Date(`${data}T23:59:59.999Z`).getTime()
            return incidentes.filter(
                ({ iniciadoEm, resolvidoEm }) =>
                    new Date(iniciadoEm).getTime() <= fimData &&
                    (!resolvidoEm || new Date(resolvidoEm).getTime() > fimData)
            ).length
        }),
        incidentes: datas.map(
            (data) => incidentes.filter(({ iniciadoEm }) => iniciadoEm.startsWith(data)).length
        ),
    }
}

export const obterDashboard = async (
    periodo: PeriodoMonitoramento
): Promise<ObterDashboard.Response> => {
    const [projetos, incidentes] = await Promise.all([listarProjetos(), listarIncidentes()])
    const limite = Date.now() - periodo * 24 * 60 * 60 * 1000
    const incidentesNoPeriodo = incidentes.filter(
        ({ iniciadoEm }) => new Date(iniciadoEm).getTime() >= limite
    )
    return {
        metricas: {
            totalProjetos: projetos.length,
            saudaveis: projetos.filter(({ status }) => status === Enum.StatusProjeto.Saudavel).length,
            degradados: projetos.filter(({ status }) => status === Enum.StatusProjeto.Degradado).length,
            offline: projetos.filter(({ status }) => status === Enum.StatusProjeto.Offline).length,
            desconhecidos: projetos.filter(({ status }) => status === Enum.StatusProjeto.Desconhecido)
                .length,
            servicosMonitorados: projetos.reduce((total, projeto) => total + projeto.servicos.length, 0),
            incidentesAbertos: incidentes.filter(
                ({ status }) => status !== Enum.StatusIncidente.Resolvido
            ).length,
            incidentes: incidentesNoPeriodo.length,
            tendencias: construirTendenciasDashboard(projetos, incidentes, limite),
        },
        projetos,
    }
}
