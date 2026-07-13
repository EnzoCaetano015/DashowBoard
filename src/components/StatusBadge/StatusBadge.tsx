import { Loader2 } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import type { StatusBadgeProps } from "@/components/StatusBadge/StatusBadge.types"
import { estilosStatus } from "@/components/StatusBadge/StatusBadge.utils"
import { cn } from "@/lib/utils"
import { labelStatusProjeto } from "@/lib/utils/status"

export const StatusBadge = ({ status, tamanho = "sm", className }: StatusBadgeProps) => {
    const estilo = estilosStatus[status]

    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium",
                estilo.fundo,
                estilo.borda,
                estilo.texto,
                tamanho === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
                className
            )}
        >
            {status === Enum.StatusProjeto.Atualizando ? (
                <Loader2 className="size-3 animate-spin" />
            ) : (
                <span className={cn("status-dot", estilo.ponto)} />
            )}
            {labelStatusProjeto[status]}
        </span>
    )
}

export const StatusDot = ({ status, className }: Pick<StatusBadgeProps, "status" | "className">) => (
    <span className={cn("status-dot", estilosStatus[status].ponto, className)} />
)
