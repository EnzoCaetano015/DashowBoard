import { Enum } from "@/backend/api/enums/enum"
import { ProjectServiceActions } from "@/components/ProjectServices/ProjectServiceActions"
import type { ProjectServiceActionsProps } from "@/components/ProjectServices/ProjectServiceActions.types"
import { StatusDot } from "@/components/StatusBadge/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const ProjectServiceCard = ({ servico, atualizando, onAtualizar }: ProjectServiceActionsProps) => (
    <Card className="gap-3 border-border py-4 shadow-none">
        <CardContent className="space-y-3 px-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <StatusDot status={servico.status} />
                    <h4 className="truncate font-medium">{servico.nome}</h4>
                </div>
                <ProjectServiceActions
                    servico={servico}
                    atualizando={atualizando}
                    onAtualizar={onAtualizar}
                />
            </div>
            <div className="flex flex-wrap gap-1.5">
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">{servico.tipo}</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted-foreground">
                    {servico.ambiente}
                </span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">Deployment</dt>
                    <dd className="mt-0.5 break-words">{servico.ultimoDeployment ?? "Não coletado"}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Resposta</dt>
                    <dd
                        className={cn(
                            "mt-0.5 font-mono tabular-nums",
                            servico.status === Enum.StatusProjeto.Offline && "text-destructive"
                        )}
                    >
                        {servico.tempoRespostaMs === null
                            ? "Não coletado"
                            : `${servico.tempoRespostaMs} ms`}
                    </dd>
                </div>
                <div className="col-span-2">
                    <dt className="text-muted-foreground">Última verificação</dt>
                    <dd className="mt-0.5">
                        {servico.ultimaVerificacao ?? "Aguardando primeira verificação"}
                    </dd>
                </div>
                {servico.mensagemStatus && (
                    <div className="col-span-2">
                        <dt className="text-muted-foreground">Detalhe do monitoramento</dt>
                        <dd className="mt-0.5 text-warning">{servico.mensagemStatus}</dd>
                    </div>
                )}
            </dl>
        </CardContent>
    </Card>
)
