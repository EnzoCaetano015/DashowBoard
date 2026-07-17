import { AlertCircle, ChevronRight, Clock, GitBranch, Server } from "lucide-react"
import { Link } from "react-router-dom"

import type { ProjectCardProps } from "@/components/ProjectCard/ProjectCard.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { StatusBadge } from "@/components/StatusBadge/StatusBadge"
import { estilosStatus } from "@/components/StatusBadge/StatusBadge.utils"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"

export const ProjectCard = ({ projeto }: ProjectCardProps) => {
    const estilo = estilosStatus[projeto.status]
    const offline = projeto.servicos.filter((servico) => servico.status === "offline").length

    return (
        <Link
            to={`/projetos/${projeto.id}`}
            className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <Card
                className={cn(
                    "relative h-full gap-4 overflow-hidden border bg-card py-4 shadow-none transition-colors group-hover:border-primary/50 group-hover:bg-surface-2",
                    estilo.borda
                )}
            >
                <span className={cn("absolute inset-x-0 top-0 h-0.5", estilo.ponto)} />
                <CardContent className="flex h-full flex-col gap-4 px-4">
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
                            repositórios
                        </span>
                        <span className="flex items-center gap-2">
                            <Server className="size-3.5" />
                            <b className="font-medium text-foreground tabular-nums">
                                {projeto.servicos.length}
                            </b>{" "}
                            serviços
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            {projeto.ultimaVerificacao
                                ? formatarDataHora(projeto.ultimaVerificacao)
                                : "Ainda não verificado"}
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
                                    className="flex size-6 items-center justify-center rounded-md bg-surface-3 ring-1 ring-border"
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
                                    Últ. incidente: {formatarDataHora(projeto.incidentes[0].iniciadoEm)}
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
