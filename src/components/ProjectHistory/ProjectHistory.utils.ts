import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export type EventoHistorico = {
    id: string
    tipo: "incidente" | "deployment" | "status"
    data: string
    titulo: string
    detalhe?: string
    tom: "success" | "warning" | "destructive" | "info"
}

export const obterEventosHistorico = (projeto: ObterProjetos.Projeto): EventoHistorico[] =>
    [
        ...projeto.incidentes.map((incidente) => ({
            id: incidente.id,
            tipo: "incidente" as const,
            data: incidente.iniciadoEm,
            titulo: incidente.titulo,
            detalhe: `${incidente.servico} · ${incidente.severidade} · ${incidente.status}`,
            tom:
                incidente.severidade === Enum.SeveridadeIncidente.Alta
                    ? ("destructive" as const)
                    : incidente.severidade === Enum.SeveridadeIncidente.Media
                      ? ("warning" as const)
                      : ("info" as const),
        })),
        ...projeto.deployments.map((deployment) => ({
            id: deployment.id,
            tipo: "deployment" as const,
            data: deployment.data,
            titulo:
                deployment.status === Enum.StatusDeployment.Sucesso
                    ? "Deploy concluído"
                    : deployment.status === Enum.StatusDeployment.Falha
                      ? "Deploy falhou"
                      : "Deploy em andamento",
            detalhe: [deployment.servico, deployment.commit, deployment.autor]
                .filter(Boolean)
                .join(" · "),
            tom:
                deployment.status === Enum.StatusDeployment.Sucesso
                    ? ("success" as const)
                    : deployment.status === Enum.StatusDeployment.Falha
                      ? ("destructive" as const)
                      : ("info" as const),
        })),
        ...projeto.historicoStatus.map((status) => ({
            id: status.id,
            tipo: "status" as const,
            data: status.verificadoEm,
            titulo: `Status observado: ${status.statusAtual}`,
            detalhe: status.statusAnterior
                ? `${status.statusAnterior} → ${status.statusAtual}`
                : "Primeira observação registrada",
            tom:
                status.statusAtual === Enum.StatusProjeto.Saudavel
                    ? ("success" as const)
                    : status.statusAtual === Enum.StatusProjeto.Offline
                      ? ("destructive" as const)
                      : ("warning" as const),
        })),
    ].sort((primeiro, segundo) => segundo.data.localeCompare(primeiro.data))
