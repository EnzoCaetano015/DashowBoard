import { useState } from "react"
import { toast } from "sonner"

import { useAtualizarProjeto } from "@/backend/api/controllers/projeto"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type { FormularioEditarProjeto } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.types"
import { criarFormularioEditarProjeto } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.utils"
import { obterMensagemErro } from "@/lib/utils/error"

export const useEditProjectDialog = (projeto: ObterProjetos.Projeto, onClose: () => void) => {
    const [formulario, setFormulario] = useState(() => criarFormularioEditarProjeto(projeto))
    const { mutateAsync: atualizarProjeto, isPending: atualizarProjetoIsPending } = useAtualizarProjeto()

    const alterarCampo = <Campo extends keyof FormularioEditarProjeto>(
        campo: Campo,
        valor: FormularioEditarProjeto[Campo]
    ) => {
        setFormulario((atual) => ({ ...atual, [campo]: valor }))
    }

    const salvar = async () => {
        if (!formulario.nome.trim()) {
            toast.error("Informe o nome do projeto.")
            return
        }

        const urlAplicacao = formulario.urlAplicacao.trim()
        if (urlAplicacao) {
            try {
                new URL(urlAplicacao)
            } catch {
                toast.error("Informe uma URL válida para a aplicação.")
                return
            }
        }

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
        atualizarProjetoIsPending,
        alterarCampo,
        salvar,
    }
}
