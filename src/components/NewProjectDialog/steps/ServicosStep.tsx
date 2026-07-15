import { Clock } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import type { ServicosStepProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { SupabaseProjectsSection } from "@/components/NewProjectDialog/steps/SupabaseProjectsSection"
import { VercelProjectsSection } from "@/components/NewProjectDialog/steps/VercelProjectsSection"
import { ProviderIcon } from "@/components/ProviderIcon"

export const ServicosStep = ({ selecionados, vercel, supabase }: ServicosStepProps) => (
    <div className="space-y-5">
        <VercelProjectsSection
            selecionados={selecionados}
            {...vercel}
        />
        <SupabaseProjectsSection
            selecionados={selecionados}
            {...supabase}
        />
        <section>
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-surface-2 p-4 text-muted-foreground">
                <ProviderIcon provider={Enum.Provider.Railway} />
                <span className="flex-1 text-sm font-medium">Railway</span>
                <span className="inline-flex items-center gap-1 text-xs">
                    <Clock className="size-3" /> Em breve
                </span>
            </div>
        </section>
    </div>
)
