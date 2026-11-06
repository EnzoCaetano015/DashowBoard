import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export const labelStatusProjeto: Record<Enum.StatusProjeto, string> = {
    [Enum.StatusProjeto.Saudavel]: "Healthy",
    [Enum.StatusProjeto.Degradado]: "Degraded",
    [Enum.StatusProjeto.Offline]: "Offline",
    [Enum.StatusProjeto.Atualizando]: "Updating",
    [Enum.StatusProjeto.Desconhecido]: "Unknown",
}

export const labelProvider: Record<Enum.Provider, string> = {
    [Enum.Provider.GitHub]: "GitHub",
    [Enum.Provider.Vercel]: "Vercel",
    [Enum.Provider.Railway]: "Railway",
    [Enum.Provider.Supabase]: "Supabase",
}

export const agregarStatus = (statuses: Enum.StatusProjeto[]) => {
    if (statuses.length === 0) return Enum.StatusProjeto.Desconhecido
    if (statuses.every((status) => status === Enum.StatusProjeto.Offline)) {
        return Enum.StatusProjeto.Offline
    }
    if (
        statuses.some((status) =>
            [Enum.StatusProjeto.Offline, Enum.StatusProjeto.Degradado].includes(status)
        )
    ) {
        return Enum.StatusProjeto.Degradado
    }
    if (statuses.includes(Enum.StatusProjeto.Desconhecido)) return Enum.StatusProjeto.Desconhecido
    if (statuses.includes(Enum.StatusProjeto.Atualizando)) return Enum.StatusProjeto.Atualizando
    return Enum.StatusProjeto.Saudavel
}

export const agregarStatusServicos = (
    servicos: Pick<ObterProjetos.Servico, "status" | "critico">[],
    statusHealthCheck?: Enum.StatusProjeto | null
) => {
    const criticos = servicos.filter(({ critico }) => critico)
    const relevantes = criticos.length > 0 ? criticos : servicos
    const statuses = relevantes.map(({ status }) => status)
    if (statusHealthCheck) statuses.push(statusHealthCheck)
    return agregarStatus(statuses)
}

// Persisted enum values remain stable; presentation labels are English.
export const serviceTypeLabels: Record<Enum.TipoServico, string> = {
    [Enum.TipoServico.Frontend]: "Frontend",
    [Enum.TipoServico.Api]: "API",
    [Enum.TipoServico.Worker]: "Worker",
    [Enum.TipoServico.BancoDados]: "Database",
    [Enum.TipoServico.Cache]: "Cache",
    [Enum.TipoServico.Fila]: "Queue",
    [Enum.TipoServico.CronJob]: "Cron job",
}

export const repositoryTagLabels: Record<Enum.TagRepositorio, string> = {
    [Enum.TagRepositorio.Frontend]: "Frontend",
    [Enum.TagRepositorio.Api]: "API",
    [Enum.TagRepositorio.Worker]: "Worker",
    [Enum.TagRepositorio.Biblioteca]: "Library",
    [Enum.TagRepositorio.Infraestrutura]: "Infrastructure",
    [Enum.TagRepositorio.Documentacao]: "Documentation",
}
