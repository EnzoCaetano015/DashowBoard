import { useQuery } from "@tanstack/react-query"

import { obterIntegracoesMock } from "@/backend/api/integrations/mock"
import { IntegracaoQueryKeys } from "@/backend/api/models/integracao.types"

export const useObterIntegracoes = () => {
    return useQuery({
        queryKey: [IntegracaoQueryKeys.ObterIntegracoes],
        queryFn: obterIntegracoesMock,
        staleTime: 1000 * 60 * 5,
    })
}
