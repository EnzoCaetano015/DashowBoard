import { Activity, CircleAlert, GitCommit } from "lucide-react"

import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { ProjectStatusDetails } from "@/components/ProjectOverview/ProjectOverview.utils"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { ResumoSerie } from "@/components/ResumoSerie/ResumoSerie"
import { DeploymentStatus, IncidentStatus } from "@/components/ProjectStatusDetails/ProjectStatusDetails"
import { Sparkline } from "@/components/Sparkline/Sparkline"
import { StatusBadge } from "@/components/StatusBadge/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { resumirSerie } from "@/lib/utils/chart"

const formatarPercentual = (valor: number) => `${valor.toFixed(2)}%`
const formatarMilissegundos = (valor: number) => `${Math.round(valor)} ms`

export const ProjectOverview = ({ projeto }: { projeto: ObterProjetos.Projeto }) => {
    const resumo = ProjectStatusDetails(projeto)
    const deployment = projeto.deployments[0]
    const incidente = projeto.incidentes[0]
    const resumoDisponibilidade = resumirSerie(projeto.disponibilidade)
    const resumoTempoResposta = resumirSerie(projeto.tempoResposta)
    const healthCheck = projeto.ultimaVerificacaoUrl

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
                <Grafico
                    titulo="Observed availability"
                    subtitulo="Last 30 days"
                    valor={
                        resumo.disponibilidadeMedia === null
                            ? "No data"
                            : `${resumo.disponibilidadeMedia.toFixed(2)}%`
                    }
                    destaque="text-success"
                >
                    {projeto.disponibilidade.length > 0 ? (
                        <Sparkline
                            dados={projeto.disponibilidade}
                            titulo="Observed availability"
                            unidade="%"
                            descricao="Observed availability in samples from the last 30 days"
                            cor="var(--color-success)"
                            altura={110}
                        />
                    ) : (
                        <EstadoSemDados />
                    )}
                    {resumoDisponibilidade && (
                        <ResumoSerie
                            resumo={resumoDisponibilidade}
                            formatarValor={formatarPercentual}
                        />
                    )}
                </Grafico>
                <Grafico
                    titulo="Response time"
                    subtitulo="ms — 30-day window"
                    valor={
                        resumo.respostaMedia === null
                            ? "No data"
                            : `${Math.round(resumo.respostaMedia)} ms`
                    }
                    destaque="text-info"
                >
                    {projeto.tempoResposta.length > 0 ? (
                        <Sparkline
                            dados={projeto.tempoResposta}
                            titulo="Response time"
                            unidade="ms"
                            descricao="Response times in samples from the last 30 days"
                            cor="var(--color-info)"
                            altura={110}
                        />
                    ) : (
                        <EstadoSemDados />
                    )}
                    {resumoTempoResposta && (
                        <ResumoSerie
                            resumo={resumoTempoResposta}
                            formatarValor={formatarMilissegundos}
                        />
                    )}
                </Grafico>
            </div>
            <div className="space-y-4">
                <Card className="gap-3 py-5">
                    <CardContent className="px-5">
                        <h3 className="text-sm font-medium">Status summary</h3>
                        <div className="mt-3 flex items-center justify-between">
                            <StatusBadge
                                status={projeto.status}
                                tamanho="md"
                            />
                            <span className="text-xs text-muted-foreground">
                                {projeto.ultimaVerificacao
                                    ? formatarDataHora(projeto.ultimaVerificacao)
                                    : "Not monitored yet"}
                            </span>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md bg-surface-2 p-3">
                                <dt className="text-xs text-muted-foreground">Healthy services</dt>
                                <dd className="mt-1 text-lg font-semibold text-success tabular-nums">
                                    {resumo.online}
                                </dd>
                            </div>
                            <div className="rounded-md bg-surface-2 p-3">
                                <dt className="text-xs text-muted-foreground">Offline services</dt>
                                <dd
                                    className={cn(
                                        "mt-1 text-lg font-semibold tabular-nums",
                                        resumo.offline ? "text-destructive" : "text-muted-foreground"
                                    )}
                                >
                                    {resumo.offline}
                                </dd>
                            </div>
                        </dl>
                        {projeto.urlAplicacao && (
                            <div className="mt-3 rounded-md border border-border bg-surface-2 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                        <Activity className="size-3.5" />
                                        URL health check
                                    </span>
                                    {healthCheck ? (
                                        <StatusBadge status={healthCheck.statusAtual} />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Not checked yet
                                        </span>
                                    )}
                                </div>
                                {healthCheck && (
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <p>
                                            {healthCheck.statusHttp
                                                ? `HTTP ${healthCheck.statusHttp} · `
                                                : ""}
                                            {healthCheck.responseTimeMs === null
                                                ? "Time not available"
                                                : `${healthCheck.responseTimeMs} ms`}
                                            {` · ${formatarDataHora(healthCheck.verificadoEm)}`}
                                        </p>
                                        {healthCheck.mensagem && <p>{healthCheck.mensagem}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="gap-3 py-5">
                    <CardContent className="px-5">
                        <h3 className="text-sm font-medium">Latest deployment</h3>
                        {deployment ? (
                            <div className="mt-3 flex items-start gap-3">
                                <span className="flex size-9 items-center justify-center rounded-md bg-surface-2">
                                    <ProviderIcon provider={deployment.provider} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                        {deployment.servico}
                                        <DeploymentStatus status={deployment.status} />
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                                        <GitCommit className="size-3" />
                                        {deployment.commit ?? "Commit not collected"} ·{" "}
                                        {deployment.autor ?? "Author not collected"}
                                    </div>
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                        {formatarDataHora(deployment.data)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">
                                No recent deployments.
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card className="gap-3 py-5">
                    <CardContent className="px-5">
                        <h3 className="text-sm font-medium">Latest incident</h3>
                        {incidente ? (
                            <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <CircleAlert className="size-4 text-destructive" />
                                    {incidente.titulo}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {incidente.servico} · {formatarDataHora(incidente.iniciadoEm)}
                                </div>
                                <div className="pt-1">
                                    <IncidentStatus
                                        status={incidente.status}
                                        severidade={incidente.severidade}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">
                                No recorded incidents.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const Grafico = ({
    titulo,
    subtitulo,
    valor,
    destaque,
    children,
}: {
    titulo: string
    subtitulo: string
    valor: string
    destaque: string
    children: React.ReactNode
}) => (
    <Card className="gap-3 py-5">
        <CardHeader className="flex-row items-start justify-between px-5">
            <div>
                <CardTitle className="text-sm">{titulo}</CardTitle>
                <p className="text-xs text-muted-foreground">{subtitulo}</p>
            </div>
            <div className="text-right">
                <strong className={cn("text-2xl font-semibold tabular-nums", destaque)}>{valor}</strong>
                <div className="text-xs text-muted-foreground">average</div>
            </div>
        </CardHeader>
        <CardContent className="px-5">{children}</CardContent>
    </Card>
)

const EstadoSemDados = () => (
    <div className="flex h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Not enough snapshots yet.
    </div>
)
