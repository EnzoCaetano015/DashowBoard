import { ProviderIcon } from "@/components/ProviderIcon"
import type { NewProjectStepProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { repositoriosDisponiveis } from "@/components/NewProjectDialog/NewProjectDialog.utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Enum } from "@/backend/api/enums/enum"

export const RepositoriosStep = ({ selecionados, alternar }: NewProjectStepProps) => (
    <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
            Selecione os repositórios do GitHub que compõem este projeto.
        </p>
        {repositoriosDisponiveis.map((repositorio) => (
            <div
                key={repositorio.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-3 hover:border-primary/50"
            >
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                        checked={selecionados.includes(repositorio.id)}
                        onCheckedChange={() => alternar(repositorio.id)}
                    />
                    <ProviderIcon provider={Enum.Provider.GitHub} />
                    <span>
                        <b className="block text-sm font-medium">{repositorio.nome}</b>
                        <span className="text-xs text-muted-foreground">main · atualizado há 2 h</span>
                    </span>
                </label>
                <Select defaultValue={repositorio.tag}>
                    <SelectTrigger className="bg-surface-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(Enum.TagRepositorio).map((tag) => (
                            <SelectItem
                                key={tag}
                                value={tag}
                            >
                                {tag}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ))}
    </div>
)
