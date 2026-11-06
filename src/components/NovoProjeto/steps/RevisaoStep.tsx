import { serviceTypeLabels, repositoryTagLabels } from "@/lib/utils/status"
import type { ReactNode } from "react"

import type { RevisaoStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { identificarServico } from "@/components/NovoProjeto/NovoProjeto.utils"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { labelProvider } from "@/lib/utils/status"

export const RevisaoStep = ({ formulario, repositorios, editarEtapa }: RevisaoStepProps) => {
    const repositoriosSelecionados = formulario.repositorios.flatMap((selecionado) => {
        const repositorio = repositorios.find(({ id }) => id === selecionado.repositoryId)
        return repositorio ? [{ repositorio, tag: selecionado.tag }] : []
    })

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Review the information before creating the local group. No external resources will be created.
            </p>

            <SecaoRevisao
                titulo="Information"
                onEditar={() => editarEtapa(1)}
            >
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <ItemRevisao
                        titulo="Name"
                        valor={formulario.nome.trim()}
                    />
                    <ItemRevisao
                        titulo="URL"
                        valor={formulario.urlAplicacao.trim() || "Not specified"}
                    />
                    <ItemRevisao
                        titulo="Description"
                        valor={formulario.descricao.trim() || "No description"}
                        className="sm:col-span-2"
                    />
                </dl>
            </SecaoRevisao>

            <SecaoRevisao
                titulo={`Repositories (${repositoriosSelecionados.length})`}
                onEditar={() => editarEtapa(2)}
            >
                {repositoriosSelecionados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No repositories selected.</p>
                ) : (
                    <ul className="space-y-2">
                        {repositoriosSelecionados.map(({ repositorio, tag }) => (
                            <li
                                key={`${repositorio.connectionId}:${repositorio.id}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2"
                            >
                                <span className="min-w-0 truncate text-sm">{repositorio.fullName}</span>
                                <Badge variant="outline">{repositoryTagLabels[tag]}</Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </SecaoRevisao>

            <SecaoRevisao
                titulo={`Services (${formulario.servicos.length})`}
                onEditar={() => editarEtapa(3)}
            >
                {formulario.servicos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No services selected.</p>
                ) : (
                    <ul className="space-y-2">
                        {formulario.servicos.map((servico) => (
                            <li
                                key={identificarServico(servico)}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2"
                            >
                                <span className="flex min-w-0 items-center gap-2 text-sm">
                                    <ProviderIcon provider={servico.provider} />
                                    <span className="truncate">{servico.nome}</span>
                                </span>
                                <span className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">{labelProvider[servico.provider]}</Badge>
                                    <Badge variant="outline">{serviceTypeLabels[servico.tipo]}</Badge>
                                    {servico.critico && <Badge variant="destructive">Critical</Badge>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </SecaoRevisao>

            <SecaoRevisao
                titulo="Relationships"
                onEditar={() => editarEtapa(4)}
            >
                {formulario.servicos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No relationships needed.</p>
                ) : (
                    <ul className="space-y-2 text-sm">
                        {formulario.servicos.map((servico) => {
                            const repositoryId = formulario.relacionamentos[identificarServico(servico)]
                            const repositorio = repositorios.find(({ id }) => String(id) === repositoryId)
                            return (
                                <li
                                    key={identificarServico(servico)}
                                    className="grid gap-1 rounded-md bg-surface-2 px-3 py-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
                                >
                                    <span className="truncate">{servico.nome}</span>
                                    <span className="text-muted-foreground" aria-hidden="true">→</span>
                                    <span className="truncate text-muted-foreground sm:text-right">
                                        {repositorio?.fullName ?? "No linked repository"}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </SecaoRevisao>

            <SecaoRevisao
                titulo="Monitoring"
                onEditar={() => editarEtapa(5)}
            >
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <ItemRevisao
                        titulo="Interval"
                        valor={formatarSegundos(formulario.intervaloVerificacao)}
                    />
                    <ItemRevisao
                        titulo="Timeout"
                        valor={formatarSegundos(formulario.timeout)}
                    />
                    <ItemRevisao
                        titulo="Notifications"
                        valor={formulario.notificacoes ? "Ativadas" : "Desativadas"}
                    />
                    <ItemRevisao
                        titulo="Deployments"
                        valor={formulario.coletarDeployments ? "Collection enabled" : "Collection disabled"}
                    />
                </dl>
            </SecaoRevisao>
        </div>
    )
}

const SecaoRevisao = ({
    titulo,
    onEditar,
    children,
}: {
    titulo: string
    onEditar: () => void
    children: ReactNode
}) => (
    <section className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{titulo}</h3>
            <Button
                variant="ghost"
                size="xs"
                onClick={onEditar}
            >
                Edit
            </Button>
        </div>
        {children}
    </section>
)

const ItemRevisao = ({
    titulo,
    valor,
    className,
}: {
    titulo: string
    valor: string
    className?: string
}) => (
    <div className={className}>
        <dt className="text-xs uppercase text-muted-foreground">{titulo}</dt>
        <dd className="mt-1 break-words">{valor}</dd>
    </div>
)

const formatarSegundos = (segundos: number) =>
    segundos >= 60 && segundos % 60 === 0
        ? `${segundos / 60} ${segundos === 60 ? "minuto" : "minutos"}`
        : `${segundos} seconds`
