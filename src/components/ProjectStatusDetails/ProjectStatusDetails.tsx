import { AlertCircle, CheckCircle2, CircleAlert, Loader2, Play } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { cn } from "@/lib/utils"

export const DeploymentStatus = ({ status }: { status: Enum.StatusDeployment }) => {
    const dados = {
        [Enum.StatusDeployment.Sucesso]: {
            titulo: "sucesso",
            classe: "text-success border-success/30 bg-success/10",
            Icone: CheckCircle2,
        },
        [Enum.StatusDeployment.Falha]: {
            titulo: "falhou",
            classe: "text-destructive border-destructive/40 bg-destructive/10",
            Icone: AlertCircle,
        },
        [Enum.StatusDeployment.EmAndamento]: {
            titulo: "em progresso",
            classe: "text-info border-info/40 bg-info/10",
            Icone: Play,
        },
    }[status]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
                dados.classe
            )}
        >
            <dados.Icone className="size-3" />
            {dados.titulo}
        </span>
    )
}

export const WorkflowStatus = ({ status }: { status: Enum.StatusWorkflow }) => {
    const dados = {
        [Enum.StatusWorkflow.Sucesso]: {
            titulo: "CI ok",
            classe: "text-success border-success/30 bg-success/10",
            Icone: CheckCircle2,
        },
        [Enum.StatusWorkflow.Falha]: {
            titulo: "CI falhou",
            classe: "text-destructive border-destructive/40 bg-destructive/10",
            Icone: AlertCircle,
        },
        [Enum.StatusWorkflow.EmAndamento]: {
            titulo: "CI rodando",
            classe: "text-info border-info/40 bg-info/10",
            Icone: Loader2,
        },
        [Enum.StatusWorkflow.Desconhecido]: {
            titulo: "CI —",
            classe: "text-muted-foreground border-border bg-surface-2",
            Icone: CircleAlert,
        },
    }[status]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px]",
                dados.classe
            )}
        >
            <dados.Icone
                className={cn("size-3", status === Enum.StatusWorkflow.EmAndamento && "animate-spin")}
            />
            {dados.titulo}
        </span>
    )
}

export const IncidentStatus = ({
    status,
    severidade,
}: {
    status: Enum.StatusIncidente
    severidade: Enum.SeveridadeIncidente
}) => {
    const classe = {
        [Enum.StatusIncidente.Resolvido]: "text-success border-success/40 bg-success/10",
        [Enum.StatusIncidente.EmAndamento]: "text-destructive border-destructive/40 bg-destructive/10",
        [Enum.StatusIncidente.Monitorando]: "text-warning border-warning/40 bg-warning/10",
    }[status]
    const titulo = {
        [Enum.StatusIncidente.Resolvido]: "resolvido",
        [Enum.StatusIncidente.EmAndamento]: "em andamento",
        [Enum.StatusIncidente.Monitorando]: "monitorando",
    }[status]

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[11px]",
                classe
            )}
        >
            {titulo} · severidade {severidade}
        </span>
    )
}
