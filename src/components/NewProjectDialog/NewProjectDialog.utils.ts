import { Enum } from "@/backend/api/enums/enum"
import type {
    RepositorioDisponivel,
    ServicoDisponivel,
} from "@/components/NewProjectDialog/NewProjectDialog.types"

export const etapasNovoProjeto = [
    { id: 1, titulo: "Informações" },
    { id: 2, titulo: "Repositórios" },
    { id: 3, titulo: "Serviços" },
    { id: 4, titulo: "Relacionamentos" },
    { id: 5, titulo: "Monitoramento" },
] as const

export const repositoriosDisponiveis: RepositorioDisponivel[] = [
    { id: "repo-front", nome: "easyrifas/plataforma-front", tag: Enum.TagRepositorio.Frontend },
    { id: "repo-api", nome: "easyrifas/plataforma-back", tag: Enum.TagRepositorio.Api },
    { id: "repo-worker", nome: "proteo/pipeline-worker", tag: Enum.TagRepositorio.Worker },
    { id: "repo-docs", nome: "farmtech/docs", tag: Enum.TagRepositorio.Documentacao },
]

export const servicosDisponiveis: ServicoDisponivel[] = [
    {
        id: "servico-web",
        nome: "easyrifas-web (prod)",
        provider: Enum.Provider.Vercel,
        tipo: Enum.TipoServico.Frontend,
    },
    {
        id: "servico-api",
        nome: "easyrifas-api",
        provider: Enum.Provider.Railway,
        tipo: Enum.TipoServico.Api,
    },
    {
        id: "servico-worker",
        nome: "payment-worker",
        provider: Enum.Provider.Railway,
        tipo: Enum.TipoServico.Worker,
    },
    {
        id: "servico-db",
        nome: "postgres-primary",
        provider: Enum.Provider.Railway,
        tipo: Enum.TipoServico.BancoDados,
    },
    {
        id: "servico-supabase",
        nome: "analytics-db",
        provider: Enum.Provider.Supabase,
        tipo: Enum.TipoServico.BancoDados,
    },
]
