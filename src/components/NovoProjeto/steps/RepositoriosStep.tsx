import { repositoryTagLabels } from "@/lib/utils/status"
import { FolderGit2, LockKeyhole, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { RepositoriosStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatarDataHora } from "@/lib/utils/date"

export const RepositoriosStep = ({
    repositorios,
    selecionados,
    runtimeDisponivel,
    quantidadeConexoes,
    isLoading,
    isFetching,
    falhas,
    alternar,
    alterarTag,
    atualizar,
}: RepositoriosStepProps) => {
    if (!runtimeDisponivel) {
        return <EstadoConexao descricao="The GitHub integration is available in the desktop app." />
    }
    if (!isLoading && quantidadeConexoes === 0) {
        return <EstadoConexao descricao="Connect your GitHub account to list repositories." />
    }
    if (isLoading) {
        return <TemplateEstado.Carregando skeleton={{ quantidade: 4, orientacao: "vertical" }} />
    }
    if (repositorios.length === 0) {
        return (
            <div className="space-y-3">
                <TemplateEstado.Vazio
                    titulo="No repositories found"
                    subtitulo="No accessible repositories were found in the configured connections."
                    Icon={FolderGit2}
                    acao={
                        <Button
                            variant="outline"
                            onClick={atualizar}
                        >
                            Refresh
                        </Button>
                    }
                />
                {falhas.length > 0 && (
                    <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                        {falhas.map((falha) => (
                            <p key={falha.connectionId}>
                                <b>{falha.connectionName}:</b> {falha.message}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Select the repositories that make up this project.
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isFetching}
                    onClick={atualizar}
                >
                    <RefreshCw className={isFetching ? "animate-spin" : undefined} /> Refresh
                </Button>
            </div>
            {falhas.length > 0 && (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                    {falhas.map((falha) => (
                        <p key={falha.connectionId}>
                            <b>{falha.connectionName}:</b> {falha.message}
                        </p>
                    ))}
                </div>
            )}
            {repositorios.map((repositorio) => {
                const selected = selecionados.find((value) => value.repositoryId === repositorio.id)
                return (
                    <div
                        key={repositorio.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-3 hover:border-primary/50"
                    >
                        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                            <Checkbox
                                checked={Boolean(selected)}
                                onCheckedChange={() => alternar(repositorio)}
                            />
                            <ProviderIcon provider={Enum.Provider.GitHub} />
                            <span className="min-w-0">
                                <b className="flex items-center gap-1 truncate text-sm font-medium">
                                    {repositorio.fullName}
                                    {repositorio.private && <LockKeyhole className="size-3" />}
                                </b>
                                <span className="line-clamp-1 text-xs text-muted-foreground">
                                    {repositorio.description || "No description"}
                                </span>
                                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span>{repositorio.defaultBranch}</span>
                                    <span>·</span>
                                    <span>{repositorio.language || "Language not specified"}</span>
                                    <span>·</span>
                                    <span>{formatarDataHora(repositorio.updatedAt)}</span>
                                    <Badge variant="outline">{repositorio.connectionName}</Badge>
                                </span>
                            </span>
                        </label>
                        {selected && (
                            <Select
                                items={repositoryTagLabels}
                                value={selected.tag}
                                onValueChange={(tag) =>
                                    tag && alterarTag(repositorio.id, tag as Enum.TagRepositorio)
                                }
                            >
                                <SelectTrigger className="w-40 bg-surface-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(Enum.TagRepositorio).map((tag) => (
                                        <SelectItem
                                            key={tag}
                                            value={tag}
                                        >
                                            {repositoryTagLabels[tag]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

const EstadoConexao = ({ descricao }: { descricao: string }) => (
    <div className="rounded-lg border border-dashed p-8 text-center">
        <ProviderIcon
            provider={Enum.Provider.GitHub}
            className="mx-auto size-8"
        />
        <p className="mt-3 text-sm text-muted-foreground">{descricao}</p>
        <Button
            render={<Link to="/integracoes" />}
            nativeButton={false}
            className="mt-4"
        >
            Go to integrations
        </Button>
    </div>
)
