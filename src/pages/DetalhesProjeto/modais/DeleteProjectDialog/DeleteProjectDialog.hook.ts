import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useExcluirProjeto } from "@/backend/api/controllers/projeto"

export const useDeleteProjectDialog = (projetoId: string, onClose: () => void) => {
    const navigate = useNavigate()
    const { mutateAsync: excluirProjeto, isPending: excluirProjetoIsPending } = useExcluirProjeto()

    const excluir = async () => {
        const exclusao = excluirProjeto({ id: projetoId })
        toast.promise(exclusao, {
            loading: "Excluindo agrupamento local...",
            success: "Agrupamento local excluído.",
            error: "Não foi possível excluir o agrupamento local.",
        })
        try {
            await exclusao
            onClose()
            void navigate("/projetos")
        } catch {
            return
        }
    }

    return {
        excluirProjetoIsPending,
        excluir,
    }
}
