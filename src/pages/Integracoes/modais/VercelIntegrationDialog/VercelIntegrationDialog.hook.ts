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
            toast.error("Informe o token da Vercel.")
            return
        }

        toast.promise(saveConnection({ token: token.trim() }), {
            loading: connection ? "Substituindo token Vercel..." : "Conectando à Vercel...",
            success: () => {
                resetForm()
                return connection ? "Token Vercel substituído." : "Vercel conectada."
            },
            error: (error) => normalizarErroVercel(error).message,
        })
    }

    const test = () => {
        const testPromise = testConnection().then((testedConnection) => {
            if (testedConnection.status === Enum.StatusIntegracao.Erro) {
                return Promise.reject({
                    code: "VERCEL_CONEXAO_INVALIDA",
                    message: testedConnection.erro ?? "A conexão Vercel apresentou um erro.",
                })
            }

            return testedConnection
        })

        toast.promise(testPromise, {
            loading: "Testando conexão Vercel...",
            success: "Conexão Vercel validada.",
            error: (error) => normalizarErroVercel(error).message,
        })
    }

    const remove = () => {
        toast.promise(removeConnection(), {
            loading: "Removendo conexão Vercel...",
            success: () => {
                resetForm()
                setModal("removerConexao", { open: false })
                return "Conexão e token Vercel removidos."
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
