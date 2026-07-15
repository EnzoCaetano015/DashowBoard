import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import { ProviderIcon } from "@/components/ProviderIcon"
import { servicosDisponiveis } from "@/components/NewProjectDialog/NewProjectDialog.utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const RelacionamentosStep = ({ repositorios }: { repositorios: RepositorioGitHub[] }) => (
    <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
            Relacione serviços mockados aos repositórios reais selecionados. Nada será persistido nesta
            etapa.
        </p>
        {servicosDisponiveis.slice(0, 4).map((servico) => (
            <div
                key={servico.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-2 p-3"
            >
                <ProviderIcon provider={servico.provider} />
                <span className="min-w-36 flex-1 truncate text-sm font-medium">{servico.nome}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <Select defaultValue="sem-repositorio">
                    <SelectTrigger className="min-w-48 bg-surface-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sem-repositorio">— sem repositório —</SelectItem>
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
        ))}
    </div>
)
