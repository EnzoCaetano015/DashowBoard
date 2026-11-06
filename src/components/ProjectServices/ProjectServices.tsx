import { serviceTypeLabels } from "@/lib/utils/status"
import { Server } from "lucide-react"
import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { ProjectServiceActions } from "@/components/ProjectServices/ProjectServiceActions"
import { ProjectServiceCard } from "@/components/ProjectServices/ProjectServiceCard"
import { StatusDot } from "@/components/StatusBadge/StatusBadge"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { agregarStatusServicos, labelProvider } from "@/lib/utils/status"

const ordem = [Enum.Provider.Vercel, Enum.Provider.Railway, Enum.Provider.Supabase, Enum.Provider.GitHub]

type ProjectServicesProps = {
    servicos: ObterProjetos.Servico[]
    onAtualizar: (servico: ObterProjetos.Servico) => void
    servicoAtualizando: (provider: Enum.Provider) => boolean
}

export const ProjectServices = ({ servicos, onAtualizar, servicoAtualizando }: ProjectServicesProps) => {
    if (servicos.length === 0) {
        return (
            <TemplateEstado.Vazio
                titulo="No linked services"
                subtitulo="Edit the project to link services from the configured providers."
                Icon={Server}
            />
        )
    }

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
                                    · {lista.length} service{lista.length > 1 ? "s" : ""}
                                </span>
                                {provider === Enum.Provider.Railway && (
                                    <span className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">
                                        aggregate status{" "}
                                        <StatusDot status={agregarStatusServicos(lista)} />
                                    </span>
                                )}
                            </div>
                            {provider === Enum.Provider.Railway ? (
                                <RailwayGroups
                                    servicos={lista}
                                    onAtualizar={onAtualizar}
                                    servicoAtualizando={servicoAtualizando}
                                />
                            ) : (
                                <ServiceList
                                    servicos={lista}
                                    onAtualizar={onAtualizar}
                                    servicoAtualizando={servicoAtualizando}
                                />
                            )}
                        </section>
                    )
                })}
        </div>
    )
}

const RailwayGroups = ({ servicos, onAtualizar, servicoAtualizando }: ProjectServicesProps) => {
    const projetos = agrupar(servicos, (servico) => servico.projetoRailway ?? "Default project")
    return (
        <div className="space-y-3">
            {Array.from(projetos.entries()).map(([nome, lista]) => (
                <Card
                    key={nome}
                    className="gap-0 overflow-hidden py-0"
                >
                    <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-4 py-2">
                        <span className="text-xs font-mono text-muted-foreground">
                            Railway project · <b className="font-medium text-foreground">{nome}</b>
                        </span>
                        <StatusDot status={agregarStatusServicos(lista)} />
                    </div>
                    <div className="space-y-2 p-3 md:hidden">
                        {lista.map((servico) => (
                            <ProjectServiceCard
                                key={servico.id}
                                servico={servico}
                                atualizando={servicoAtualizando(servico.provider)}
                                onAtualizar={onAtualizar}
                            />
                        ))}
                    </div>
                    <div className="hidden md:block">
                        <ServiceTable
                            servicos={lista}
                            onAtualizar={onAtualizar}
                            servicoAtualizando={servicoAtualizando}
                        />
                    </div>
                </Card>
            ))}
        </div>
    )
}

const ServiceList = ({ servicos, onAtualizar, servicoAtualizando }: ProjectServicesProps) => (
    <>
        <div className="space-y-2 md:hidden">
            {servicos.map((servico) => (
                <ProjectServiceCard
                    key={servico.id}
                    servico={servico}
                    atualizando={servicoAtualizando(servico.provider)}
                    onAtualizar={onAtualizar}
                />
            ))}
        </div>
        <Card className="hidden overflow-hidden py-0 md:block">
            <ServiceTable
                servicos={servicos}
                onAtualizar={onAtualizar}
                servicoAtualizando={servicoAtualizando}
            />
        </Card>
    </>
)

const ServiceTable = ({ servicos, onAtualizar, servicoAtualizando }: ProjectServicesProps) => (
    <div className="overflow-x-auto">
        <Table className="min-w-4xl">
            <TableHeader>
                <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type / environment</TableHead>
                    <TableHead>Deployment</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Check</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {servicos.map((servico) => (
                    <TableRow key={servico.id}>
                        <TableCell>
                            <div>
                                <div className="flex items-center gap-2">
                                    <StatusDot status={servico.status} />
                                    <span className="font-medium">{servico.nome}</span>
                                </div>
                                {servico.mensagemStatus && (
                                    <p className="mt-1 max-w-60 text-xs text-warning">
                                        {servico.mensagemStatus}
                                    </p>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1.5">
                                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                                    {serviceTypeLabels[servico.tipo]}
                                </span>
                                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted-foreground">
                                    {servico.ambiente}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {servico.ultimoDeployment ?? "Not collected"}
                        </TableCell>
                        <TableCell
                            className={cn(
                                "font-mono text-xs tabular-nums",
                                servico.status === Enum.StatusProjeto.Offline && "text-destructive"
                            )}
                        >
                            {servico.tempoRespostaMs === null
                                ? "Not collected"
                                : `${servico.tempoRespostaMs} ms`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {servico.ultimaVerificacao ?? "Waiting for the first check"}
                        </TableCell>
                        <TableCell>
                            <ProjectServiceActions
                                servico={servico}
                                atualizando={servicoAtualizando(servico.provider)}
                                onAtualizar={onAtualizar}
                            />
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
