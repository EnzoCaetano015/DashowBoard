import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ResumoProps } from "./Resumo.types"

export const Resumo = ({ titulo, valor, classe }: ResumoProps) => (
    <Card className="py-4">
        <CardContent className="px-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
            <div className={cn("mt-2 text-3xl font-semibold tabular-nums", classe)}>{valor}</div>
        </CardContent>
    </Card>
)
