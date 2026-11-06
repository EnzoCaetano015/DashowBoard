import { History } from "lucide-react"
import { useState } from "react"

import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { BarChart } from "@/components/BarChart/BarChart"
import { ResumoSerie } from "@/components/ResumoSerie/ResumoSerie"
import {
    filtrarEventosHistoricoPorPeriodo,
    obterEventosHistorico,
} from "@/components/ProjectHistory/ProjectHistory.utils"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { resumirSerie } from "@/lib/utils/chart"

const formatarMilissegundos = (valor: number) => `${Math.round(valor)} ms`

export const ProjectHistory = ({ projeto }: { projeto: ObterProjetos.Projeto }) => {
    const [periodo, setPeriodo] = useState<PeriodoMonitoramento>(15)
    const eventos = filtrarEventosHistoricoPorPeriodo(obterEventosHistorico(projeto), periodo)
    const temposResposta = projeto.tempoResposta.slice(-periodo)
    const resumoTemposResposta = resumirSerie(temposResposta)

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    A timeline of incidents, status changes, and deployments.
                </p>
                <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5">
                    {PERIODOS_MONITORAMENTO.map((valor) => (
                        <Button
                            key={valor}
                            variant="ghost"
                            size="xs"
                            onClick={() => setPeriodo(valor)}
                            aria-pressed={periodo === valor}
                            className={cn(
                                periodo === valor && "bg-primary/15 text-primary"
                            )}
                        >
                            {valor} days
                        </Button>
                    ))}
                </div>
            </div>
            <Card className="gap-3 py-5">
                <CardHeader className="flex-row items-center justify-between px-5">
                    <CardTitle className="text-sm">Response time — {periodo} days</CardTitle>
                    <span className="text-xs text-muted-foreground">ms per day</span>
                </CardHeader>
                <CardContent className="px-5">
                    {projeto.tempoResposta.length > 0 ? (
                        <BarChart
                            dados={temposResposta}
                            titulo={`Response time over ${periodo} days`}
                            unidade="ms"
                            descricao={`Response times from the last ${temposResposta.length} available samples`}
                            cor="var(--color-info)"
                            altura={120}
                        />
                    ) : (
                        <div className="flex h-30 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                            No response times have been collected yet.
                        </div>
                    )}
                    {resumoTemposResposta && (
                        <ResumoSerie
                            resumo={resumoTemposResposta}
                            formatarValor={formatarMilissegundos}
                        />
                    )}
                </CardContent>
            </Card>
            <Card className="gap-4 py-5">
                <CardHeader className="px-5">
                    <CardTitle className="text-sm">Events</CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                    {eventos.length === 0 ? (
                        <TemplateEstado.Vazio
                            titulo={`No events in the last ${periodo} days`}
                            subtitulo="Select another period or wait for new monitoring observations."
                            Icon={History}
                        />
                    ) : (
                        <div className="relative pl-4">
                            <span
                                className="absolute bottom-1 left-1 top-1 w-px bg-border"
                                aria-hidden="true"
                            />
                            <ol className="space-y-4">
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
                                            aria-hidden="true"
                                        />
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <h4 className="text-sm font-medium">{evento.titulo}</h4>
                                            <time className="font-mono text-[11px] text-muted-foreground">
                                                {formatarDataHora(evento.data)}
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
                                                evento.tom === "info" &&
                                                    "border-info/40 bg-info/10 text-info"
                                            )}
                                        >
                                            {evento.tipo === "incidente" ? "Incident" : evento.tipo}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
