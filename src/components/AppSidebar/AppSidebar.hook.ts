import { toast } from "sonner"

import {
    useObterPreferencias,
    useSalvarPreferencias,
} from "@/backend/api/controllers/preferencias"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"
import { obterMensagemErro } from "@/lib/utils/error"

export const useAppSidebar = () => {
    const {
        data: preferencias = PREFERENCIAS_PADRAO,
        isLoading: preferenciasIsLoading,
        isError: preferenciasIsError,
    } = useObterPreferencias()
    const { mutateAsync: salvarPreferencias, isPending: salvarPreferenciasIsPending } =
        useSalvarPreferencias()

    const alternarSidebar = () => {
        if (preferenciasIsLoading || preferenciasIsError || salvarPreferenciasIsPending) return

        void salvarPreferencias({
            ...preferencias,
            sidebarCompacta: !preferencias.sidebarCompacta,
        }).catch((erro) => {
            toast.error(obterMensagemErro(erro, "Não foi possível salvar o estado da barra lateral."))
        })
    }

    return {
        compacta: preferencias.sidebarCompacta,
        alternarSidebar,
        alternarSidebarDesabilitado:
            preferenciasIsLoading || preferenciasIsError || salvarPreferenciasIsPending,
    }
}
