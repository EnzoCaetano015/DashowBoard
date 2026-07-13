import { useParams } from "react-router-dom"
import { toast } from "sonner"

import { useObterProjetoPorId } from "@/backend/api/controllers/projeto"

export const useDetalhesProjeto = () => {
    const { id } = useParams<{ id: string }>()
    const consulta = useObterProjetoPorId({ id })

    const atualizar = async () => {
        await consulta.refetch()
        toast.success("Projeto atualizado com dados mockados.")
    }

    return {
        projeto: consulta.data,
        isLoading: consulta.isLoading,
        isError: consulta.isError,
        isFetching: consulta.isFetching,
        atualizar,
        tentarNovamente: consulta.refetch,
    }
}
