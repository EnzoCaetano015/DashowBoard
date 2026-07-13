import { useObterProjetos } from "@/backend/api/controllers/projeto"

export const useProjetos = () => {
    const consulta = useObterProjetos()

    return {
        projetos: consulta.data ?? [],
        isLoading: consulta.isLoading,
        isError: consulta.isError,
        tentarNovamente: consulta.refetch,
    }
}
