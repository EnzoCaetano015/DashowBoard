import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexaoVercel,
    useRemoverConexaoVercel,
    useSalvarConexaoVercel,
    useTestarConexaoVercel,
} from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarErroVercel } from "@/lib/utils/vercel"

export const useVercelIntegrationDialog = () => {
    const { modal, setModal } = useControlModal(["removerConexao"] as const)
    const [token, setToken] = useState("")
    const [formVisible, setFormVisible] = useState(false)
    const { data: connection, isLoading: connectionIsLoading } = useObterConexaoVercel()
    const { mutateAsync: saveConnection, isPending: saveConnectionIsPending } = useSalvarConexaoVercel()
    const { mutateAsync: testConnection, isPending: testConnectionIsPending } = useTestarConexaoVercel()
    const { mutateAsync: removeConnection, isPending: removeConnectionIsPending } =
        useRemoverConexaoVercel()

    const resetForm = () => {
        setToken("")
        setFormVisible(false)
    }

    const save = () => {
        if (!token.trim()) {
            toast.error("Enter your Vercel token.")
            return
        }

        toast.promise(saveConnection({ token: token.trim() }), {
            loading: connection ? "Replacing Vercel token..." : "Connecting to Vercel...",
            success: () => {
                resetForm()
                return connection ? "Vercel token replaced." : "Vercel connected."
            },
            error: (error) => normalizarErroVercel(error).message,
        })
    }

    const test = () => {
        const testPromise = testConnection().then((testedConnection) => {
            if (testedConnection.status === Enum.StatusIntegracao.Erro) {
                return Promise.reject({
                    code: "VERCEL_CONEXAO_INVALIDA",
                    message: testedConnection.erro ?? "The Vercel connection returned an error.",
                })
            }

            return testedConnection
        })

        toast.promise(testPromise, {
            loading: "Testing Vercel connection...",
            success: "Vercel connection validated.",
            error: (error) => normalizarErroVercel(error).message,
        })
    }

    const remove = () => {
        toast.promise(removeConnection(), {
            loading: "Removing Vercel connection...",
            success: () => {
                resetForm()
                setModal("removerConexao", { open: false })
                return "Vercel connection and token removed."
            },
            error: (error) => normalizarErroVercel(error).message,
        })
    }

    return {
        modal,
        runtimeDisponivel: possuiRuntimeTauri(),
        connection: connection ?? null,
        isLoading: connectionIsLoading,
        isPending: saveConnectionIsPending || testConnectionIsPending || removeConnectionIsPending,
        removeIsPending: removeConnectionIsPending,
        token,
        formVisible,
        setToken,
        showForm: !connection || formVisible,
        startUpdate: () => setFormVisible(true),
        resetForm,
        save,
        test,
        startRemove: () => setModal("removerConexao", { open: true }),
        cancelRemove: () => {
            if (!removeConnectionIsPending) setModal("removerConexao", { open: false })
        },
        remove,
    }
}
