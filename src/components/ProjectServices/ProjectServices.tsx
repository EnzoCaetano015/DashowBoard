import { ExternalLink, RefreshCw } from "lucide-react"
import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { StatusDot } from "@/components/StatusBadge/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { agregarStatusServicos, labelProvider } from "@/lib/utils/status"

const ordem = [Enum.Provider.Vercel, Enum.Provider.Railway, Enum.Provider.Supabase, Enum.Provider.GitHub]

type ProjectServicesProps = {
    servicos: ObterProjetos.Servico[]
    onAtualizar: () => void
}

export const ProjectServices = ({ servicos, onAtualizar }: ProjectServicesProps) => {
    const agrupados = agrupar(servicos, (servico) => servico.provider)

    return (
        <div className="space-y-6">
            {ordem
                .filter((provider) => agrupados.has(provider))
                .map((provider) => {
                    const lista = agrupados.get(provider) ?? []
                    return (
                        <section key={provider}>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-md bg-surface-2 ring-1 ring-border">
                                    <ProviderIcon provider={provider} />
                                </span>
                                <h3 className="text-sm font-semibold">{labelProvider[provider]}</h3>
                                <span className="text-xs text-muted-foreground">
                                    · {lista.length} serviço{lista.length > 1 ? "s" : ""}
                                </span>
                                {provider === Enum.Provider.Railway && (
                                    <span className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">
                                        status agregado{" "}
                                        <StatusDot status={agregarStatusServicos(lista)} />
                                    </span>
                                )}
                            </div>
                            {provider === Enum.Provider.Railway ? (
                                <RailwayGroups
                                    servicos={lista}
                                    onAtualizar={onAtualizar}
                                />
                            ) : (
                                <Card className="overflow-hidden border-border py-0 shadow-none">
                                    <ServiceTable
                                        servicos={lista}
                                        onAtualizar={onAtualizar}
                                    />
                                </Card>
                            )}
                        </section>
                    )
                })}
        </div>
    )
}

const RailwayGroups = ({ servicos, onAtualizar }: ProjectServicesProps) => {
    const projetos = agrupar(servicos, (servico) => servico.projetoRailway ?? "Projeto padrão")
    return (
        <div className="space-y-3">
            {Array.from(projetos.entries()).map(([nome, lista]) => (
                <Card
                    key={nome}
                    className="gap-0 overflow-hidden border-border py-0 shadow-none"
                >
                    <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-4 py-2">
                        <span className="text-xs font-mono text-muted-foreground">
                            projeto Railway · <b className="font-medium text-foreground">{nome}</b>
                        </span>
                        <StatusDot status={agregarStatusServicos(lista)} />
                    </div>
                    <ServiceTable
                        servicos={lista}
                        onAtualizar={onAtualizar}
                    />
                </Card>
            ))}
        </div>
    )
}

const ServiceTable = ({ servicos, onAtualizar }: ProjectServicesProps) => (
    <div className="overflow-x-auto">
        <Table className="min-w-4xl">
            <TableHeader>
                <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Tipo / ambiente</TableHead>
                    <TableHead>Deployment</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {servicos.map((servico) => (
                    <TableRow key={servico.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <StatusDot status={servico.status} />
                                <span className="font-medium">{servico.nome}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1.5">
                                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                                    {servico.tipo}
                                </span>
                                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted-foreground">
                                    {servico.ambiente}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {servico.ultimoDeployment ?? "Não coletado"}
                        </TableCell>
                        <TableCell
                            className={cn(
                                "font-mono text-xs tabular-nums",
                                servico.status === Enum.StatusProjeto.Offline && "text-destructive"
                            )}
                        >
                            {servico.tempoRespostaMs === null
                                ? "Não coletado"
                                : `${servico.tempoRespostaMs} ms`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {servico.ultimaVerificacao ?? "Aguardando primeira verificação"}
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-end gap-1">
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    title="Atualizar serviço"
                                    onClick={onAtualizar}
                                >
                                    <RefreshCw />
                                </Button>
                                {servico.urlExterna && (
                                    <Button
                                        render={
                                            <a
                                                href={servico.urlExterna}
                                                target="_blank"
                                                rel="noreferrer"
                                            />
                                        }
                                        nativeButton={false}
                                        size="icon-sm"
                                        variant="ghost"
                                        title="Abrir provider"
                                    >
                                        <ExternalLink />
                                    </Button>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
)

const agrupar = <T, C extends string>(itens: T[], obterChave: (item: T) => C) => {
    return itens.reduce<Map<C, T[]>>((grupos, item) => {
        const chave = obterChave(item)
        grupos.set(chave, [...(grupos.get(chave) ?? []), item])
        return grupos
    }, new Map<C, T[]>())
}
