import { AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import { IncidentStatus } from "@/components/ProjectStatusDetails/ProjectStatusDetails"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatarDataHora, formatarDuracao } from "@/lib/utils/date"
import { labelProvider } from "@/lib/utils/status"
import type { IncidentCardProps } from "@/pages/Incidentes/components/IncidentCard/IncidentCard.types"

export const IncidentCard = ({ incidente }: IncidentCardProps) => {
    const ativo = incidente.status !== Enum.StatusIncidente.Resolvido

    return (
        <Card
            className={cn(
                "gap-3 border-border py-4 shadow-none",
                ativo && "border-l-2 border-l-destructive bg-destructive/5"
            )}
        >
            <CardContent className="space-y-3 px-4">
                <div className="flex items-start gap-2">
                    {ativo ? (
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    ) : (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{incidente.titulo}</h3>
                            <Badge variant={ativo ? "destructive" : "outline"}>
                                {ativo ? "Ativo" : "Resolvido"}
                            </Badge>
                        </div>
                        <div className="mt-1">
                            <IncidentStatus
                                status={incidente.status}
                                severidade={incidente.severidade}
                            />
                        </div>
                    </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <dt className="text-muted-foreground">Projeto</dt>
                        <dd className="mt-0.5">
                            <Link
                                to={`/projetos/${incidente.projetoId}`}
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {incidente.projetoNome}
                                <ExternalLink className="size-3" />
                            </Link>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Serviço</dt>
                        <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span>{incidente.servico}</span>
                            {incidente.provider && (
                                <Badge
                                    variant="outline"
                                    className="gap-1"
                                >
                                    <ProviderIcon
                                        provider={incidente.provider}
                                        className="size-3"
                                        decorativo
                                    />
                                    {labelProvider[incidente.provider]}
                                </Badge>
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Início</dt>
                        <dd className="mt-0.5 inline-flex items-center gap-1.5">
                            <Clock className="size-3" />
                            {formatarDataHora(incidente.iniciadoEm)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Duração</dt>
                        <dd className="mt-0.5 font-mono tabular-nums">
                            {formatarDuracao(incidente.duracaoMinutos)}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    )
}
