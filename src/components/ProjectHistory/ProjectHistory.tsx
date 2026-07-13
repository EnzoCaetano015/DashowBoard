import { useState } from "react"

import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { BarChart } from "@/components/BarChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"
import { cn } from "@/lib/utils"
import { obterEventosHistorico } from "@/components/ProjectHistory/ProjectHistory.utils"

export const ProjectHistory = ({ projeto }: { projeto: ObterProjetos.Projeto }) => {
    const [periodo, setPeriodo] = useState<PeriodoMonitoramento>(15)
    const eventos = obterEventosHistorico(projeto)

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Linha do tempo de incidentes, mudanças de status e deployments.
                </p>
                <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5">
                    {PERIODOS_MONITORAMENTO.map((valor) => (
                        <Button
                            key={valor}
                            variant="ghost"
                            size="xs"
                            onClick={() => setPeriodo(valor)}
                            className={cn(periodo === valor && "bg-primary/20 text-primary")}
                        >
                            {valor} dias
                        </Button>
                    ))}
                </div>
            </div>
            <Card className="gap-3 border-border py-5 shadow-none">
                <CardHeader className="flex-row items-center justify-between px-5">
                    <CardTitle className="text-sm">Tempo de resposta — {periodo} dias</CardTitle>
                    <span className="text-xs text-muted-foreground">ms por dia</span>
                </CardHeader>
                <CardContent className="px-5">
                    <BarChart
                        dados={projeto.tempoResposta.slice(-periodo)}
                        cor="var(--color-info)"
                        altura={120}
                    />
                </CardContent>
            </Card>
            <Card className="gap-4 border-border py-5 shadow-none">
                <CardHeader className="px-5">
                    <CardTitle className="text-sm">Eventos</CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                    <ol className="relative space-y-4 pl-4">
                        <span className="absolute bottom-1 left-1 top-1 w-px bg-border" />
                        {eventos.map((evento) => (
                            <li
                                key={evento.id}
                                className="relative pl-4"
                            >
                                <span
                                    className={cn(
                                        "absolute -left-0.75 top-1.5 size-2.5 rounded-full ring-4 ring-card",
                                        evento.tom === "success" && "bg-success",
                                        evento.tom === "warning" && "bg-warning",
                                        evento.tom === "destructive" && "bg-destructive",
                                        evento.tom === "info" && "bg-info"
                                    )}
                                />
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h4 className="text-sm font-medium">{evento.titulo}</h4>
                                    <time className="font-mono text-[11px] text-muted-foreground">
                                        {evento.data}
                                    </time>
                                </div>
                                {evento.detalhe && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {evento.detalhe}
                                    </p>
                                )}
                                <span
                                    className={cn(
                                        "mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                                        evento.tom === "success" &&
                                            "border-success/40 bg-success/10 text-success",
                                        evento.tom === "warning" &&
                                            "border-warning/40 bg-warning/10 text-warning",
                                        evento.tom === "destructive" &&
                                            "border-destructive/40 bg-destructive/10 text-destructive",
                                        evento.tom === "info" && "border-info/40 bg-info/10 text-info"
                                    )}
                                >
                                    {evento.tipo}
                                </span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}
