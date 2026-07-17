import type { ServicosStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { RailwayProjectsSection } from "@/components/NovoProjeto/steps/RailwayProjectsSection"
import { SupabaseProjectsSection } from "@/components/NovoProjeto/steps/SupabaseProjectsSection"
import { VercelProjectsSection } from "@/components/NovoProjeto/steps/VercelProjectsSection"

export const ServicosStep = ({ selecionados, vercel, supabase, railway }: ServicosStepProps) => (
    <div className="space-y-5">
        <VercelProjectsSection
            selecionados={selecionados}
            {...vercel}
        />
        <SupabaseProjectsSection
            selecionados={selecionados}
            {...supabase}
        />
        <RailwayProjectsSection
            selecionados={selecionados}
            {...railway}
        />
    </div>
)
