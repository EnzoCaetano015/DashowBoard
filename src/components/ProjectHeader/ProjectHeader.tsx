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
            Projetos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-5">
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
                        Última verificação{" "}
                        {projeto.ultimaVerificacao
                            ? formatarDataHora(projeto.ultimaVerificacao)
                            : "ainda não realizada"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Server className="size-3.5" />
                        {projeto.servicos.length} serviços · {projeto.repositorios.length} repositórios
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                        {projeto.providers.map((provider) => (
                            <span
                                key={provider}
                                className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5"
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
                    Atualizar agora
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onEditar}
                >
                    <Pencil />
                    Editar
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
                        Abrir aplicação
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={onExcluir}
                >
                    <Trash2 />
                    Excluir
                </Button>
            </div>
        </div>
    </div>
)
