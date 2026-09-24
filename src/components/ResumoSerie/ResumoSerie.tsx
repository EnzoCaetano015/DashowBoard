import type { ResumoSerieProps } from "@/components/ResumoSerie/ResumoSerie.types"

export const ResumoSerie = ({ resumo, formatarValor }: ResumoSerieProps) => (
    <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-surface-2 px-2.5 py-2">
            <dt className="text-muted-foreground">Mínimo</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{formatarValor(resumo.minimo)}</dd>
        </div>
        <div className="rounded-md bg-surface-2 px-2.5 py-2">
            <dt className="text-muted-foreground">Média</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{formatarValor(resumo.media)}</dd>
        </div>
        <div className="rounded-md bg-surface-2 px-2.5 py-2">
            <dt className="text-muted-foreground">Máximo</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{formatarValor(resumo.maximo)}</dd>
        </div>
    </dl>
)
