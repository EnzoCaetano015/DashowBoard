import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useExcluirProjeto } from "@/backend/api/controllers/projeto"

export const useDeleteProjectDialog = (projetoId: string, onClose: () => void) => {
    const navigate = useNavigate()
    const { mutateAsync: excluirProjeto, isPending: excluirProjetoIsPending } = useExcluirProjeto()

    const excluir = async () => {
        const exclusao = excluirProjeto({ id: projetoId })
        toast.promise(exclusao, {
            loading: "Deleting local group...",
            success: "Local group deleted.",
            error: "Unable to delete the local group.",
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
