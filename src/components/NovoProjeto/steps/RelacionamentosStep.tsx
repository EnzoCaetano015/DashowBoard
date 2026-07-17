import type { RelacionamentosStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { identificarServico } from "@/components/NovoProjeto/NovoProjeto.utils"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SEM_REPOSITORIO = "sem-repositorio"

export const RelacionamentosStep = ({
    repositorios,
    servicos,
    relacionamentos,
    alterarRelacionamento,
}: RelacionamentosStepProps) => (
    <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
            Relacione cada serviço a um repositório selecionado, quando houver essa relação.
        </p>
        {servicos.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhum serviço selecionado.
            </div>
        ) : (
            servicos.map((servico) => {
                const id = identificarServico(servico)
                return (
                    <div
                        key={id}
                        className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-2 p-3"
                    >
                        <ProviderIcon provider={servico.provider} />
                        <span className="min-w-36 flex-1 truncate text-sm font-medium">
                            {servico.nome}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Select
                            value={relacionamentos[id] ?? SEM_REPOSITORIO}
                            onValueChange={(valor) =>
                                alterarRelacionamento(servico, valor === SEM_REPOSITORIO ? null : valor)
                            }
                        >
                            <SelectTrigger className="min-w-48 bg-surface-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SEM_REPOSITORIO}>— sem repositório —</SelectItem>
                                {repositorios.map((repositorio) => (
                                    <SelectItem
                                        key={repositorio.id}
                                        value={String(repositorio.id)}
                                    >
                                        {repositorio.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )
            })
        )}
    </div>
)
