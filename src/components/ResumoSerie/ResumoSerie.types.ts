import type { ResumoSerie as ResumoSerieDados } from "@/lib/types/chart"

export type ResumoSerieProps = {
    resumo: ResumoSerieDados
    formatarValor: (valor: number) => string
}
