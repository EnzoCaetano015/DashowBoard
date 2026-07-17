import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type SkeletonConfig = {
    quantidade: number
    orientacao: "vertical" | "horizontal"
}

export type CarregandoProps = {
    skeleton: SkeletonConfig
    Icon?: LucideIcon
    className?: string
    titulo?: string
    subtitulo?: string
}

export type VazioProps = {
    titulo?: string
    subtitulo?: string
    Icon?: LucideIcon
    acao?: ReactNode
    className?: string
}

export type ErroProps = {
    titulo: string
    subtitulo: string
    Icon?: LucideIcon
    acao?: ReactNode
    className?: string
}
