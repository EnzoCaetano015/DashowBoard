import { ArrowLeft, Clock, ExternalLink, Pencil, RefreshCw, Server, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import type { ProjectHeaderProps } from "@/components/ProjectHeader/ProjectHeader.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { StatusBadge } from "@/components/StatusBadge/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { labelProvider } from "@/lib/utils/status"

export const ProjectHeader = ({
    projeto,
    atualizando,
    onAtualizar,
    onEditar,
    onExcluir,
}: ProjectHeaderProps) => (
    <div className="mb-6">
        <Link
            to="/projetos"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="size-3.5" />
            Projects
        </Link>
        <div className="glass-panel flex flex-wrap items-start justify-between gap-5 rounded-3xl bg-card p-6">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="truncate text-2xl font-semibold tracking-tight">{projeto.nome}</h1>
                    <StatusBadge
                        status={projeto.status}
                        tamanho="md"
                    />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{projeto.descricao}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Last check{" "}
                        {projeto.ultimaVerificacao
                            ? formatarDataHora(projeto.ultimaVerificacao)
                            : "not checked yet"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Server className="size-3.5" />
                        {projeto.servicos.length} services · {projeto.repositorios.length} repositories
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                        {projeto.providers.map((provider) => (
                            <span
                                key={provider}
                                className="glass-subtle inline-flex items-center gap-1 rounded-lg px-2 py-1"
                            >
                                <ProviderIcon
                                    provider={provider}
                                    className="size-3"
                                />
                                {labelProvider[provider]}
                            </span>
                        ))}
                    </span>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    size="sm"
                    onClick={onAtualizar}
                    disabled={atualizando}
                >
                    <RefreshCw className={cn(atualizando && "animate-spin")} />
                    Refresh now
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onEditar}
                >
                    <Pencil />
                    Edit
                </Button>
                {projeto.urlAplicacao && (
                    <Button
                        render={
                            <a
                                href={projeto.urlAplicacao}
                                target="_blank"
                                rel="noreferrer"
                            />
                        }
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                    >
                        <ExternalLink />
                        Open application
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={onExcluir}
                >
                    <Trash2 />
                    Delete
                </Button>
            </div>
        </div>
    </div>
)
