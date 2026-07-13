import type { ReactNode } from "react"

export type DestaqueMetrica = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

export type MetricCardProps = {
    titulo: string
    valor: ReactNode
    dica?: string
    icone?: ReactNode
    destaque?: DestaqueMetrica
    tendencia?: number[]
}
