import { ExternalLink, Loader2, RefreshCw } from "lucide-react"

import { IconAction } from "@/components/IconAction/IconAction"
import type { ProjectServiceActionsProps } from "@/components/ProjectServices/ProjectServiceActions.types"

export const ProjectServiceActions = ({ servico, atualizando, onAtualizar }: ProjectServiceActionsProps) => (
    <div className="flex justify-end gap-1">
        <IconAction
            size="icon-sm"
            variant="ghost"
            label={`Refresh service data ${servico.nome}`}
            disabled={atualizando}
            onClick={() => onAtualizar(servico)}
        >
            {atualizando ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        </IconAction>
        {servico.urlExterna && (
            <IconAction
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
                label={`Open ${servico.nome} on the provider`}
            >
                <ExternalLink />
            </IconAction>
        )}
    </div>
)
