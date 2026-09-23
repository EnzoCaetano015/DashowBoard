import type { FiltroSelectProps } from "@/components/FiltroSelect/FiltroSelect.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export const FiltroSelect = ({
    value,
    placeholder,
    ariaLabel,
    onValueChange,
    opcoes,
    className,
}: FiltroSelectProps) => (
    <Select
        value={value}
        onValueChange={(valor) => valor && onValueChange(valor)}
    >
        <SelectTrigger
            className={cn("h-9 min-w-36 bg-surface-2", className)}
            aria-label={ariaLabel}
        >
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {opcoes.map(([valor, titulo]) => (
                <SelectItem
                    key={valor}
                    value={valor}
                >
                    {titulo}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
)
