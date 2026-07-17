import { useObterProjetos } from "@/backend/api/controllers/projeto"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useProjetos = () => {
    const { modal, setModal } = useControlModal(["novoProjeto"] as const)

    const {
        data: projetos = [],
        isLoading: projetosIsLoading,
        isError: projetosIsError,
        refetch: atualizarProjetos,
    } = useObterProjetos()

    return {
        modal,
        setModal,
        projetos,
        runtimeDisponivel: possuiRuntimeTauri(),
        isLoading: projetosIsLoading,
        isError: projetosIsError,
        atualizar: atualizarProjetos,
    }
}
