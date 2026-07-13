import type { DestaqueMetrica, MetricCardProps } from "@/components/MetricCard/MetricCard.types"
import { Sparkline } from "@/components/Sparkline"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const estilos: Record<DestaqueMetrica, { texto: string; anel: string; cor: string }> = {
    primary: { texto: "text-primary", anel: "ring-primary/30", cor: "var(--color-primary)" },
    success: { texto: "text-success", anel: "ring-success/30", cor: "var(--color-success)" },
    warning: { texto: "text-warning", anel: "ring-warning/30", cor: "var(--color-warning)" },
    destructive: {
        texto: "text-destructive",
        anel: "ring-destructive/30",
        cor: "var(--color-destructive)",
    },
    info: { texto: "text-info", anel: "ring-info/30", cor: "var(--color-info)" },
    muted: { texto: "text-muted-foreground", anel: "ring-border", cor: "var(--color-muted-foreground)" },
}

export const MetricCard = ({
    titulo,
    valor,
    dica,
    icone,
    destaque = "primary",
    tendencia,
}: MetricCardProps) => {
    const estilo = estilos[destaque]

    return (
        <Card className="gap-3 border-border bg-card py-4 shadow-none">
            <CardContent className="flex flex-col gap-3 px-4">
                <div className="flex items-start justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {titulo}
                    </span>
                    {icone && (
                        <span
                            className={cn(
                                "flex size-7 items-center justify-center rounded-md bg-surface-2 ring-1",
                                estilo.anel,
                                estilo.texto
                            )}
                        >
                            {icone}
                        </span>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                    <strong
                        className={cn(
                            "text-3xl font-semibold tracking-tight tabular-nums",
                            estilo.texto
                        )}
                    >
                        {valor}
                    </strong>
                    {dica && <span className="text-xs text-muted-foreground">{dica}</span>}
                </div>
                {tendencia?.length ? (
                    <Sparkline
                        dados={tendencia}
                        cor={estilo.cor}
                        altura={32}
                    />
                ) : null}
            </CardContent>
        </Card>
    )
}
