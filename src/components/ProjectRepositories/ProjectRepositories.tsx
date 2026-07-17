import { ArrowUpRight, CircleAlert, GitBranch, GitCommit, GitPullRequest } from "lucide-react"

import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { WorkflowStatus } from "@/components/ProjectStatusDetails/ProjectStatusDetails"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Enum } from "@/backend/api/enums/enum"

export const ProjectRepositories = ({ repositorios }: { repositorios: ObterProjetos.Repositorio[] }) => (
    <div className="space-y-3">
        {repositorios.map((repositorio) => (
            <Card
                key={repositorio.id}
                className="border-border py-4 shadow-none"
            >
                <CardContent className="flex flex-col gap-4 px-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <ProviderIcon provider={Enum.Provider.GitHub} />
                            <h3 className="truncate font-semibold">{repositorio.nome}</h3>
                            <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                <GitBranch className="size-3" />
                                {repositorio.branch ?? "Não coletado"}
                            </span>
                            {repositorio.statusWorkflow && (
                                <WorkflowStatus status={repositorio.statusWorkflow} />
                            )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{repositorio.descricao}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {repositorio.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                            <div className="rounded-md bg-surface-2 p-2.5">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <GitCommit className="size-3" />
                                    último commit
                                </div>
                                {repositorio.ultimoCommit ? (
                                    <>
                                        <div className="mt-1 truncate font-mono text-xs">
                                            {repositorio.ultimoCommit.sha}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {repositorio.ultimoCommit.mensagem}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                                            {repositorio.ultimoCommit.autor} ·{" "}
                                            {repositorio.ultimoCommit.data}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Não coletado
                                    </div>
                                )}
                            </div>
                            <Contador
                                Icone={CircleAlert}
                                titulo="issues abertas"
                                valor={repositorio.issuesAbertas}
                            />
                            <Contador
                                Icone={GitPullRequest}
                                titulo="PRs abertas"
                                valor={repositorio.pullRequestsAbertas}
                            />
                        </div>
                    </div>
                    {repositorio.url && (
                        <Button
                            render={
                                <a
                                    href={repositorio.url}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            }
                            nativeButton={false}
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                        >
                            <ArrowUpRight />
                            Abrir no GitHub
                        </Button>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
)

const Contador = ({
    Icone,
    titulo,
    valor,
}: {
    Icone: typeof CircleAlert
    titulo: string
    valor: number | null
}) => (
    <div className="rounded-md bg-surface-2 p-2.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icone className="size-3" />
            {titulo}
        </div>
        <div className="mt-1 text-lg font-semibold tabular-nums">{valor ?? "Não coletado"}</div>
    </div>
)
