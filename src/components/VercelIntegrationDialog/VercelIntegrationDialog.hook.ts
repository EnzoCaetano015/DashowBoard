import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexaoVercel,
    useRemoverConexaoVercel,
    useSalvarConexaoVercel,
    useTestarConexaoVercel,
} from "@/backend/api/controllers/vercel"
import { Enum } from "@/backend/api/enums/enum"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"
import { normalizarErroVercel } from "@/lib/utils/vercel"

export const useVercelIntegrationDialog = () => {
    const [token, setToken] = useState("")
    const [formVisible, setFormVisible] = useState(false)
    const connectionQuery = useObterConexaoVercel()
    const saveConnection = useSalvarConexaoVercel()
    const testConnection = useTestarConexaoVercel()
    const removeConnection = useRemoverConexaoVercel()

    const resetForm = () => {
        setToken("")
        setFormVisible(false)
    }

    const save = async () => {
        if (!token.trim()) {
            toast.error("Informe o token da Vercel.")
            return
        }
        try {
            await saveConnection.mutateAsync({ token })
            resetForm()
            toast.success(connectionQuery.data ? "Token Vercel substituído." : "Vercel conectada.")
        } catch (error) {
            toast.error(normalizarErroVercel(error).message)
        }
    }

    const test = async () => {
        try {
            const connection = await testConnection.mutateAsync()
            if (connection.status === Enum.StatusIntegracao.Erro) {
                toast.error(connection.erro ?? "A conexão Vercel apresentou um erro.")
                return
            }
            toast.success("Conexão Vercel validada.")
        } catch (error) {
            toast.error(normalizarErroVercel(error).message)
        }
    }

    const remove = async () => {
        try {
            await removeConnection.mutateAsync()
            resetForm()
            toast.success("Conexão e token Vercel removidos.")
        } catch (error) {
            toast.error(normalizarErroVercel(error).message)
        }
    }

    return {
        runtimeDisponivel: possuiRuntimeTauri(),
        connection: connectionQuery.data ?? null,
        isLoading: connectionQuery.isLoading,
        isError: connectionQuery.isError,
        error: connectionQuery.error,
        isPending:
            saveConnection.isPending || testConnection.isPending || removeConnection.isPending,
        token,
        formVisible,
        setToken,
        showForm: !connectionQuery.data || formVisible,
        startUpdate: () => setFormVisible(true),
        resetForm,
        save,
        test,
        remove,
        retry: connectionQuery.refetch,
    }
}
