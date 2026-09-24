import { toast } from "sonner"

import {
    useObterPreferencias,
    useSalvarPreferencias,
} from "@/backend/api/controllers/preferencias"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"
import { obterMensagemErro } from "@/lib/utils/error"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useAppSidebar = () => {
    const runtimeDisponivel = possuiRuntimeTauri()
    const {
        data: preferencias = PREFERENCIAS_PADRAO,
        isLoading: preferenciasIsLoading,
        isError: preferenciasIsError,
    } = useObterPreferencias()
    const { mutateAsync: salvarPreferencias, isPending: salvarPreferenciasIsPending } =
        useSalvarPreferencias()

    const alternarSidebar = () => {
        if (
            !runtimeDisponivel ||
            preferenciasIsLoading ||
            preferenciasIsError ||
            salvarPreferenciasIsPending
        )
            return

        void salvarPreferencias({
            ...preferencias,
            sidebarCompacta: !preferencias.sidebarCompacta,
        }).catch((erro) => {
            toast.error(obterMensagemErro(erro, "Não foi possível salvar o estado da barra lateral."))
        })
    }

    return {
        compacta: runtimeDisponivel ? preferencias.sidebarCompacta : false,
        alternarSidebar,
        alternarSidebarDesabilitado:
            !runtimeDisponivel ||
            preferenciasIsLoading ||
            preferenciasIsError ||
            salvarPreferenciasIsPending,
    }
}
