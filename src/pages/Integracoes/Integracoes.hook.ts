import { toast } from "sonner"

import { useObterIntegracoes } from "@/backend/api/controllers/integracao"
import type { Enum } from "@/backend/api/enums/enum"
import { labelProvider } from "@/lib/utils/status"

export const useIntegracoes = () => {
    const consulta = useObterIntegracoes()

    return {
        integracoes: consulta.data ?? [],
        isLoading: consulta.isLoading,
        isError: consulta.isError,
        tentarNovamente: consulta.refetch,
        testar: (provider: Enum.Provider) =>
            toast.success(`Teste visual de ${labelProvider[provider]} concluído.`),
    }
}
