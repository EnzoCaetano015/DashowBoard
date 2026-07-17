import { Enum } from "@/backend/api/enums/enum"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import { obterBancoDados } from "@/backend/sql/database"

type IncidenteRow = {
    id: string
    projetoId: string
    projetoNome: string
    servicoId: string | null
    servico: string | null
    titulo: string
    descricao: string | null
    status: string
    severidade: string
    abertoEm: string
    resolvidoEm: string | null
}

type AbrirIncidenteRequest = {
    projetoId: string
    servicoId: string
    servicoNome: string
    status: Enum.StatusProjeto
}

const mapearIncidente = (row: IncidenteRow): ObterIncidentes.Incidente => {
    const fim = row.resolvidoEm ? new Date(row.resolvidoEm).getTime() : Date.now()
    const inicio = new Date(row.abertoEm).getTime()
    const duracaoMinutos = Number.isFinite(inicio) ? Math.max(0, Math.round((fim - inicio) / 60_000)) : 0

    return {
        id: row.id,
        projetoId: row.projetoId,
        projetoNome: row.projetoNome,
        servicoId: row.servicoId,
        titulo: row.titulo,
        descricao: row.descricao,
        servico: row.servico ?? "Serviço removido",
        status: row.status as Enum.StatusIncidente,
        severidade: row.severidade as Enum.SeveridadeIncidente,
        iniciadoEm: row.abertoEm,
        duracaoMinutos,
        resolvidoEm: row.resolvidoEm,
    }
}

const selecionarIncidentes = async (projetoId?: string) => {
    const database = await obterBancoDados()
    return database.select<IncidenteRow[]>(
        `
            SELECT
                i.id,
                i.projeto_id AS projetoId,
                p.nome AS projetoNome,
                i.servico_id AS servicoId,
                s.nome AS servico,
                i.titulo,
                i.descricao,
                i.status,
                i.severidade,
                i.aberto_em AS abertoEm,
                i.resolvido_em AS resolvidoEm
            FROM incidentes i
            INNER JOIN projetos p ON p.id = i.projeto_id
            LEFT JOIN projeto_servicos s ON s.id = i.servico_id
            WHERE ($1 IS NULL OR i.projeto_id = $1)
            ORDER BY i.aberto_em DESC
        `,
        [projetoId ?? null]
    )
}

export const listarIncidentes = async (): Promise<ObterIncidentes.Response> => {
    return (await selecionarIncidentes()).map(mapearIncidente)
}

export const listarIncidentesPorProjeto = async (
    projetoId: string
): Promise<ObterIncidentes.Response> => {
    return (await selecionarIncidentes(projetoId)).map(mapearIncidente)
}

export const obterIncidenteAberto = async (servicoId: string) => {
    const database = await obterBancoDados()
    const [incidente] = await database.select<IncidenteRow[]>(
        `
            SELECT
                i.id,
                i.projeto_id AS projetoId,
                p.nome AS projetoNome,
                i.servico_id AS servicoId,
                s.nome AS servico,
                i.titulo,
                i.descricao,
                i.status,
                i.severidade,
                i.aberto_em AS abertoEm,
                i.resolvido_em AS resolvidoEm
            FROM incidentes i
            INNER JOIN projetos p ON p.id = i.projeto_id
            LEFT JOIN projeto_servicos s ON s.id = i.servico_id
            WHERE i.servico_id = $1 AND i.resolvido_em IS NULL
            LIMIT 1
        `,
        [servicoId]
    )
    return incidente ? mapearIncidente(incidente) : undefined
}

export const abrirIncidente = async (request: AbrirIncidenteRequest) => {
    if (await obterIncidenteAberto(request.servicoId)) return

    const database = await obterBancoDados()
    const severidade =
        request.status === Enum.StatusProjeto.Offline
            ? Enum.SeveridadeIncidente.Alta
            : Enum.SeveridadeIncidente.Media
    await database.execute(
        `
            INSERT INTO incidentes (
                id, projeto_id, servico_id, titulo, descricao, status, severidade, aberto_em
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
            crypto.randomUUID(),
            request.projetoId,
            request.servicoId,
            `${request.servicoNome} ${request.status === Enum.StatusProjeto.Offline ? "ficou offline" : "está degradado"}`,
            "Mudança de status detectada automaticamente pelo monitoramento.",
            Enum.StatusIncidente.EmAndamento,
            severidade,
            new Date().toISOString(),
        ]
    )
}

export const resolverIncidente = async (servicoId: string) => {
    const database = await obterBancoDados()
    await database.execute(
        `
            UPDATE incidentes
            SET status = $1, resolvido_em = $2
            WHERE servico_id = $3 AND resolvido_em IS NULL
        `,
        [Enum.StatusIncidente.Resolvido, new Date().toISOString(), servicoId]
    )
}
