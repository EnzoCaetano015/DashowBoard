import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type { ModalControlProps } from "@/lib/types/modal"

export type FormularioEditarProjeto = {
    nome: string
    descricao: string
    urlAplicacao: string
    intervaloVerificacaoSegundos: number
    timeoutSegundos: number
    notificacoesAtivas: boolean
    coletarDeployments: boolean
}

export type CampoInformacoesEditarProjeto = "nome" | "urlAplicacao"

export type ErrosInformacoesEditarProjeto = Partial<
    Record<CampoInformacoesEditarProjeto, string>
>

export type EditProjectDialogProps = ModalControlProps & {
    projeto: ObterProjetos.Projeto
}
