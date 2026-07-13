import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export const labelStatusProjeto: Record<Enum.StatusProjeto, string> = {
    [Enum.StatusProjeto.Saudavel]: "Saudável",
    [Enum.StatusProjeto.Degradado]: "Degradado",
    [Enum.StatusProjeto.Offline]: "Offline",
    [Enum.StatusProjeto.Atualizando]: "Atualizando",
    [Enum.StatusProjeto.Desconhecido]: "Desconhecido",
}

export const labelProvider: Record<Enum.Provider, string> = {
    [Enum.Provider.GitHub]: "GitHub",
    [Enum.Provider.Vercel]: "Vercel",
    [Enum.Provider.Railway]: "Railway",
    [Enum.Provider.Supabase]: "Supabase",
}

export const agregarStatusServicos = (servicos: ObterProjetos.Servico[]) => {
    if (!servicos.length) return Enum.StatusProjeto.Desconhecido
    if (servicos.every((servico) => servico.status === Enum.StatusProjeto.Offline))
        return Enum.StatusProjeto.Offline
    if (servicos.some((servico) => servico.status === Enum.StatusProjeto.Offline))
        return Enum.StatusProjeto.Degradado
    if (servicos.some((servico) => servico.status === Enum.StatusProjeto.Degradado))
        return Enum.StatusProjeto.Degradado
    if (servicos.some((servico) => servico.status === Enum.StatusProjeto.Atualizando))
        return Enum.StatusProjeto.Atualizando
    if (servicos.every((servico) => servico.status === Enum.StatusProjeto.Saudavel))
        return Enum.StatusProjeto.Saudavel
    return Enum.StatusProjeto.Desconhecido
}
