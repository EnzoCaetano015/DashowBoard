import { Enum } from "@/backend/api/enums/enum"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { useIntegracoes as useIntegracoesDisponiveis } from "@/lib/hooks/useIntegracoes"

export const useIntegracoes = () => {
    const { modal, setModal } = useControlModal([
        "integracaoGitHub",
        "integracaoVercel",
        "integracaoSupabase",
        "integracaoRailway",
    ] as const)
    const integracoes = useIntegracoesDisponiveis()

    const abrirDialogo = (provider: Enum.Provider) => {
        if (provider === Enum.Provider.GitHub) {
            setModal("integracaoGitHub", { open: true })
        }
        if (provider === Enum.Provider.Vercel) {
            setModal("integracaoVercel", { open: true })
        }
        if (provider === Enum.Provider.Supabase) {
            setModal("integracaoSupabase", { open: true })
        }
        if (provider === Enum.Provider.Railway) {
            setModal("integracaoRailway", { open: true })
        }
    }

    return {
        modal,
        setModal,
        integracoes,
        abrirDialogo,
    }
}
