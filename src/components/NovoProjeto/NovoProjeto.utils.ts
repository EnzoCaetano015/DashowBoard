import { Enum } from "@/backend/api/enums/enum"
import type { RepositorioGitHub } from "@/backend/api/models/github.types"
import type {
    ErrosInformacoesNovoProjeto,
    FormularioNovoProjeto,
    ServicoSelecionado,
} from "@/components/NovoProjeto/NovoProjeto.types"
import { validarInformacoesProjeto } from "@/lib/utils/projeto"

export const etapasNovoProjeto = [
    { id: 1, titulo: "Informações" },
    { id: 2, titulo: "Repositórios" },
    { id: 3, titulo: "Serviços" },
    { id: 4, titulo: "Relacionamentos" },
    { id: 5, titulo: "Monitoramento" },
    { id: 6, titulo: "Revisão" },
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

const normalizarTermosRepositorio = (repositorio: RepositorioGitHub) =>
    [repositorio.nome, repositorio.fullName, repositorio.language ?? "", ...repositorio.topics]
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

const possuiTermo = (conteudo: string, termos: string[]) =>
    termos.some((termo) => new RegExp(`(^|[^a-z0-9])${termo}([^a-z0-9]|$)`, "i").test(conteudo))

export const inferirTagRepositorio = (repositorio: RepositorioGitHub): Enum.TagRepositorio => {
    const conteudo = normalizarTermosRepositorio(repositorio)

    if (possuiTermo(conteudo, ["docs?", "documentation", "storybook", "wiki"]))
        return Enum.TagRepositorio.Documentacao
    if (
        possuiTermo(conteudo, [
            "infra",
            "terraform",
            "pulumi",
            "ansible",
            "kubernetes",
            "k8s",
            "helm",
            "hcl",
        ])
    )
        return Enum.TagRepositorio.Infraestrutura
    if (possuiTermo(conteudo, ["api", "backend", "server", "graphql"]))
        return Enum.TagRepositorio.Api
    if (possuiTermo(conteudo, ["worker", "queue", "jobs?", "consumer"]))
        return Enum.TagRepositorio.Worker
    if (possuiTermo(conteudo, ["frontend", "web", "website", "ui", "react", "vue", "html", "css"]))
        return Enum.TagRepositorio.Frontend
    if (possuiTermo(conteudo, ["lib", "library", "package", "sdk", "component"]))
        return Enum.TagRepositorio.Biblioteca

    return Enum.TagRepositorio.Biblioteca
}

export const obterErrosInformacoesNovoProjeto = (
    formulario: Pick<FormularioNovoProjeto, "nome" | "urlAplicacao">
): ErrosInformacoesNovoProjeto => {
    return validarInformacoesProjeto(formulario)
}

export const formularioNovoProjetoFoiAlterado = (formulario: FormularioNovoProjeto) => {
    const inicial = criarFormularioNovoProjeto()
    return (
        formulario.nome !== inicial.nome ||
        formulario.descricao !== inicial.descricao ||
        formulario.urlAplicacao !== inicial.urlAplicacao ||
        formulario.repositorios.length > 0 ||
        formulario.servicos.length > 0 ||
        Object.keys(formulario.relacionamentos).length > 0 ||
        formulario.intervaloVerificacao !== inicial.intervaloVerificacao ||
        formulario.timeout !== inicial.timeout ||
        formulario.notificacoes !== inicial.notificacoes ||
        formulario.coletarDeployments !== inicial.coletarDeployments
    )
}
