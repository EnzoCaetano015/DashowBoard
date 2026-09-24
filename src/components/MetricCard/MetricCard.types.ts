import type { ReactNode } from "react"

export type DestaqueMetrica = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

type MetricCardBaseProps = {
    titulo: string
    valor: ReactNode
    dica?: string
    icone?: ReactNode
    destaque?: DestaqueMetrica
}

export type MetricCardProps = MetricCardBaseProps &
    (
        | {
              tendencia: number[]
              unidadeTendencia: string
          }
        | {
              tendencia?: undefined
              unidadeTendencia?: never
          }
    )
