import { Enum } from "@/backend/api/enums/enum"
import type {
    FormularioNovoProjeto,
    ServicoSelecionado,
} from "@/components/NovoProjeto/NovoProjeto.types"

export const etapasNovoProjeto = [
    { id: 1, titulo: "Informações" },
    { id: 2, titulo: "Repositórios" },
    { id: 3, titulo: "Serviços" },
    { id: 4, titulo: "Relacionamentos" },
    { id: 5, titulo: "Monitoramento" },
] as const

export const criarFormularioNovoProjeto = (): FormularioNovoProjeto => ({
    nome: "",
    descricao: "",
    urlAplicacao: "",
    repositorios: [],
    servicos: [],
    relacionamentos: {},
    intervaloVerificacao: Enum.IntervaloAtualizacao.CincoMinutos,
    timeout: 5,
    notificacoes: false,
    coletarDeployments: true,
})

export const identificarServico = (servico: ServicoSelecionado) =>
    [
        servico.provider,
        servico.scopeId ?? "personal",
        servico.externalProjectId,
        servico.externalEnvironmentId ?? "project",
        servico.externalServiceId ?? "project",
    ].join(":")
