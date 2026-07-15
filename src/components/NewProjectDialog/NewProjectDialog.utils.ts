import { Enum } from "@/backend/api/enums/enum"
import type {
    ServicoDisponivel,
} from "@/components/NewProjectDialog/NewProjectDialog.types"

export const etapasNovoProjeto = [
    { id: 1, titulo: "Informações" },
    { id: 2, titulo: "Repositórios" },
    { id: 3, titulo: "Serviços" },
    { id: 4, titulo: "Relacionamentos" },
    { id: 5, titulo: "Monitoramento" },
] as const

export const servicosDisponiveis: ServicoDisponivel[] = [
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
