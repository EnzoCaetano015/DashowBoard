import type { Enum } from "@/backend/api/enums/enum"

export type StatusBadgeProps = {
    status: Enum.StatusProjeto
    tamanho?: "sm" | "md"
    className?: string
}
