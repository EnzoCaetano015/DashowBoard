import { ExternalLink, RefreshCw } from "lucide-react"

import { IconAction } from "@/components/IconAction/IconAction"
import type { ProjectServiceActionsProps } from "@/components/ProjectServices/ProjectServiceActions.types"

export const ProjectServiceActions = ({ servico, onAtualizar }: ProjectServiceActionsProps) => (
    <div className="flex justify-end gap-1">
        <IconAction
            size="icon-sm"
            variant="ghost"
            label={`Atualizar dados do serviço ${servico.nome}`}
            onClick={onAtualizar}
        >
            <RefreshCw />
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
                label={`Abrir ${servico.nome} no provider`}
            >
                <ExternalLink />
            </IconAction>
        )}
    </div>
)
