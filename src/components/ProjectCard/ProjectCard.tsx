import { AlertCircle, ChevronRight, Clock, GitBranch, Server } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { ProjectCardProps } from "@/components/ProjectCard/ProjectCard.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { StatusBadge } from "@/components/StatusBadge/StatusBadge"
import { estilosStatus } from "@/components/StatusBadge/StatusBadge.utils"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"

export const ProjectCard = ({ projeto }: ProjectCardProps) => {
    const estilo = estilosStatus[projeto.status]
    const offline = projeto.servicos.filter(
        (servico) => servico.status === Enum.StatusProjeto.Offline
    ).length

    return (
        <Link
            to={`/projetos/${projeto.id}`}
            className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <Card
                className={cn(
                    "relative h-full gap-4 overflow-hidden bg-card py-5 transition-all group-hover:border-primary/40 group-hover:bg-surface-1 group-hover:shadow-2xl",
                    estilo.borda
                )}
            >
                <span className={cn("absolute left-6 right-6 top-0 h-px opacity-80", estilo.ponto)} />
                <CardContent className="flex h-full flex-col gap-5 px-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold">{projeto.nome}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {projeto.descricao}
                            </p>
                        </div>
                        <StatusBadge status={projeto.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <GitBranch className="size-3.5" />
                            <b className="font-medium text-foreground tabular-nums">
                                {projeto.repositorios.length}
                            </b>{" "}
                            repositories
                        </span>
                        <span className="flex items-center gap-2">
                            <Server className="size-3.5" />
                            <b className="font-medium text-foreground tabular-nums">
                                {projeto.servicos.length}
                            </b>{" "}
                            services
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            {projeto.ultimaVerificacao
                                ? formatarDataHora(projeto.ultimaVerificacao)
                                : "Not checked yet"}
                        </span>
                        <span
                            className={cn("flex items-center gap-2", offline > 0 && "text-destructive")}
                        >
                            <AlertCircle className="size-3.5" />
                            <b className="font-medium tabular-nums">{offline}</b> offline
                        </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                        <div className="flex items-center gap-1.5">
                            {projeto.providers.map((provider) => (
                                <span
                                    key={provider}
                                    className="glass-subtle flex size-7 items-center justify-center rounded-xl"
                                >
                                    <ProviderIcon
                                        provider={provider}
                                        className="size-3.5"
                                    />
                                </span>
                            ))}
                        </div>
                        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                            {projeto.incidentes[0] && (
                                <span className="truncate">
                                    Latest incident: {formatarDataHora(projeto.incidentes[0].iniciadoEm)}
                                </span>
                            )}
                            <ChevronRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
