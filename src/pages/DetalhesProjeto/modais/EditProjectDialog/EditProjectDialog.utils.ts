import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type { FormularioEditarProjeto } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.types"

export const criarFormularioEditarProjeto = (
    projeto: ObterProjetos.Projeto
): FormularioEditarProjeto => ({
    nome: projeto.nome,
    descricao: projeto.descricao,
    urlAplicacao: projeto.urlAplicacao ?? "",
    intervaloVerificacaoSegundos: projeto.intervaloVerificacaoSegundos,
    timeoutSegundos: projeto.timeoutSegundos,
    notificacoesAtivas: projeto.notificacoesAtivas,
    coletarDeployments: projeto.coletarDeployments,
})
