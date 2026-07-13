import { ProviderIcon } from "@/components/ProviderIcon"
import type { NewProjectStepProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { servicosDisponiveis } from "@/components/NewProjectDialog/NewProjectDialog.utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Enum } from "@/backend/api/enums/enum"
import { labelProvider } from "@/lib/utils/status"

export const ServicosStep = ({ selecionados, alternar }: NewProjectStepProps) => (
    <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
            Escolha os serviços em Vercel, Railway ou Supabase.
        </p>
        {servicosDisponiveis.map((servico) => (
            <div
                key={servico.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-3 hover:border-primary/50"
            >
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                        checked={selecionados.includes(servico.id)}
                        onCheckedChange={() => alternar(servico.id)}
                    />
                    <ProviderIcon provider={servico.provider} />
                    <span>
                        <b className="block text-sm font-medium">{servico.nome}</b>
                        <span className="text-xs text-muted-foreground">
                            {labelProvider[servico.provider]}
                        </span>
                    </span>
                </label>
                <Select defaultValue={servico.tipo}>
                    <SelectTrigger className="bg-surface-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(Enum.TipoServico).map((tipo) => (
                            <SelectItem
                                key={tipo}
                                value={tipo}
                            >
                                {tipo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ))}
    </div>
)
