import { AlertCircle, LockKeyhole, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { RepositoriosStepProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { ProviderIcon } from "@/components/ProviderIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatarDataHora } from "@/lib/utils/date"

export const RepositoriosStep = ({
    repositorios,
    selecionados,
    runtimeDisponivel,
    quantidadeConexoes,
    isLoading,
    isFetching,
    isError,
    erro,
    falhas,
    alternar,
    alterarTag,
    tentarNovamente,
    atualizar,
}: RepositoriosStepProps) => {
    if (!runtimeDisponivel) {
        return (
            <EstadoConexao descricao="A integração GitHub está disponível no aplicativo desktop." />
        )
    }
    if (!isLoading && quantidadeConexoes === 0) {
        return <EstadoConexao descricao="Conecte sua conta GitHub para listar os repositórios." />
    }
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-28" />
                ))}
            </div>
        )
    }
    if (isError) {
        return (
            <div className="rounded-lg border border-destructive/40 p-8 text-center">
                <AlertCircle className="mx-auto size-8 text-destructive" />
                <h3 className="mt-3 font-medium">Falha ao consultar o GitHub</h3>
                <p className="mt-1 text-sm text-muted-foreground">{erro}</p>
                <Button className="mt-4" variant="outline" onClick={tentarNovamente}>
                    Tentar novamente
                </Button>
            </div>
        )
    }
    if (repositorios.length === 0 && falhas.length > 0) {
        return (
            <div className="rounded-lg border border-destructive/40 p-8 text-center">
                <AlertCircle className="mx-auto size-8 text-destructive" />
                <h3 className="mt-3 font-medium">Nenhuma conexão pôde listar repositórios</h3>
                {falhas.map((falha) => (
                    <p
                        key={falha.connectionId}
                        className="mt-1 text-sm text-muted-foreground"
                    >
                        <b>{falha.connectionName}:</b> {falha.message}
                    </p>
                ))}
                <Button className="mt-4" variant="outline" onClick={tentarNovamente}>
                    Tentar novamente
                </Button>
            </div>
        )
    }
    if (repositorios.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Nenhum repositório acessível foi encontrado.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Selecione os repositórios reais que compõem este projeto.
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isFetching}
                    onClick={atualizar}
                >
                    <RefreshCw className={isFetching ? "animate-spin" : undefined} /> Atualizar
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
                                    {repositorio.description || "Sem descrição"}
                                </span>
                                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span>{repositorio.defaultBranch}</span>
                                    <span>·</span>
                                    <span>
                                        {repositorio.language || "Linguagem não informada"}
                                    </span>
                                    <span>·</span>
                                    <span>{formatarDataHora(repositorio.updatedAt)}</span>
                                    <Badge variant="outline">
                                        {repositorio.connectionName}
                                    </Badge>
                                </span>
                            </span>
                        </label>
                        {selected && (
                            <Select
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
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
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
        <ProviderIcon provider={Enum.Provider.GitHub} className="mx-auto size-8" />
        <p className="mt-3 text-sm text-muted-foreground">{descricao}</p>
        <Button render={<Link to="/integracoes" />} nativeButton={false} className="mt-4">
            Ir para Integrações
        </Button>
    </div>
)
