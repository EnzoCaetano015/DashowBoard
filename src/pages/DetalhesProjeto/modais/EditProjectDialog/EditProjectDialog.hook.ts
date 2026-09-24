import { useState } from "react"
import { toast } from "sonner"

import { useAtualizarProjeto } from "@/backend/api/controllers/projeto"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type {
    CampoInformacoesEditarProjeto,
    FormularioEditarProjeto,
} from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.types"
import { criarFormularioEditarProjeto } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.utils"
import { obterMensagemErro } from "@/lib/utils/error"
import { validarInformacoesProjeto } from "@/lib/utils/projeto"

export const useEditProjectDialog = (projeto: ObterProjetos.Projeto, onClose: () => void) => {
    const [formulario, setFormulario] = useState(() => criarFormularioEditarProjeto(projeto))
    const [camposValidados, setCamposValidados] = useState({ nome: false, urlAplicacao: false })
    const { mutateAsync: atualizarProjeto, isPending: atualizarProjetoIsPending } = useAtualizarProjeto()

    const alterarCampo = <Campo extends keyof FormularioEditarProjeto>(
        campo: Campo,
        valor: FormularioEditarProjeto[Campo]
    ) => {
        setFormulario((atual) => ({ ...atual, [campo]: valor }))
    }

    const errosEncontrados = validarInformacoesProjeto(formulario)
    const erros = {
        nome: camposValidados.nome ? errosEncontrados.nome : undefined,
        urlAplicacao: camposValidados.urlAplicacao
            ? errosEncontrados.urlAplicacao
            : undefined,
    }
    const validarCampo = (campo: CampoInformacoesEditarProjeto) => {
        setCamposValidados((atuais) => ({ ...atuais, [campo]: true }))
    }

    const salvar = async () => {
        setCamposValidados({ nome: true, urlAplicacao: true })
        if (errosEncontrados.nome || errosEncontrados.urlAplicacao) return
        const urlAplicacao = formulario.urlAplicacao.trim()

        const atualizacao = atualizarProjeto({
            id: projeto.id,
            nome: formulario.nome.trim(),
            descricao: formulario.descricao.trim(),
            urlAplicacao: urlAplicacao || null,
            intervaloVerificacaoSegundos: formulario.intervaloVerificacaoSegundos,
            timeoutSegundos: formulario.timeoutSegundos,
            notificacoesAtivas: formulario.notificacoesAtivas,
            coletarDeployments: formulario.coletarDeployments,
        })

        toast.promise(atualizacao, {
            loading: "Salvando projeto...",
            success: "Projeto atualizado.",
            error: (erro) => obterMensagemErro(erro, "Não foi possível atualizar o projeto."),
        })

        try {
            await atualizacao
            onClose()
        } catch {
            return
        }
    }

    return {
        formulario,
        erros,
        atualizarProjetoIsPending,
        alterarCampo,
        validarCampo,
        salvar,
    }
}
