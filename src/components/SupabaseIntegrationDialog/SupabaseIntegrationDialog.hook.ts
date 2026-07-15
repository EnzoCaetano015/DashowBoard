import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexaoSupabase,
    useRemoverConexaoSupabase,
    useSalvarConexaoSupabase,
    useTestarConexaoSupabase,
} from "@/backend/api/controllers/supabase"
import { Enum } from "@/backend/api/enums/enum"
import { normalizarErroSupabase } from "@/lib/utils/supabase"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useSupabaseIntegrationDialog = () => {
    const [token, setToken] = useState("")
    const [formVisible, setFormVisible] = useState(false)
    const connectionQuery = useObterConexaoSupabase()
    const saveConnection = useSalvarConexaoSupabase()
    const testConnection = useTestarConexaoSupabase()
    const removeConnection = useRemoverConexaoSupabase()

    const resetForm = () => {
        setToken("")
        setFormVisible(false)
    }

    const save = async () => {
        const tokenNormalizado = token.trim()
        if (!tokenNormalizado) {
            toast.error("Informe o Personal Access Token do Supabase.")
            return
        }
        try {
            await saveConnection.mutateAsync({ token: tokenNormalizado })
            resetForm()
            toast.success(connectionQuery.data ? "Token Supabase substituído." : "Supabase conectado.")
        } catch (error) {
            toast.error(normalizarErroSupabase(error).message)
        }
    }

    const test = async () => {
        try {
            const connection = await testConnection.mutateAsync()
            if (connection.status === Enum.StatusIntegracao.Erro) {
                toast.error(connection.erro ?? "A conexão Supabase apresentou um erro.")
                return
            }
            toast.success("Conexão Supabase validada.")
        } catch (error) {
            toast.error(normalizarErroSupabase(error).message)
        }
    }

    const remove = async () => {
        try {
            await removeConnection.mutateAsync()
            resetForm()
            toast.success("Conexão e token Supabase removidos.")
        } catch (error) {
            toast.error(normalizarErroSupabase(error).message)
        }
    }

    return {
        runtimeDisponivel: possuiRuntimeTauri(),
        connection: connectionQuery.data ?? null,
        isLoading: connectionQuery.isLoading,
        isError: connectionQuery.isError,
        error: connectionQuery.error,
        isPending: saveConnection.isPending || testConnection.isPending || removeConnection.isPending,
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
