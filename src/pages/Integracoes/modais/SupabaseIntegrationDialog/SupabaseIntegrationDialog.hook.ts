import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexaoSupabase,
    useRemoverConexaoSupabase,
    useSalvarConexaoSupabase,
    useTestarConexaoSupabase,
} from "@/backend/api/controllers/supabase"
import { Enum } from "@/backend/api/enums/enum"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { normalizarErroSupabase } from "@/lib/utils/supabase"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useSupabaseIntegrationDialog = () => {
    const { modal, setModal } = useControlModal(["removerConexao"] as const)
    const [token, setToken] = useState("")
    const [formVisible, setFormVisible] = useState(false)
    const { data: connection, isLoading: connectionIsLoading } = useObterConexaoSupabase()
    const { mutateAsync: saveConnection, isPending: saveConnectionIsPending } =
        useSalvarConexaoSupabase()
    const { mutateAsync: testConnection, isPending: testConnectionIsPending } =
        useTestarConexaoSupabase()
    const { mutateAsync: removeConnection, isPending: removeConnectionIsPending } =
        useRemoverConexaoSupabase()

    const resetForm = () => {
        setToken("")
        setFormVisible(false)
    }

    const save = () => {
        const tokenNormalizado = token.trim()
        if (!tokenNormalizado) {
            toast.error("Informe o Personal Access Token do Supabase.")
            return
        }

        toast.promise(saveConnection({ token: tokenNormalizado }), {
            loading: connection ? "Substituindo token Supabase..." : "Conectando ao Supabase...",
            success: () => {
                resetForm()
                return connection ? "Token Supabase substituído." : "Supabase conectado."
            },
            error: (error) => normalizarErroSupabase(error).message,
        })
    }

    const test = () => {
        const testPromise = testConnection().then((testedConnection) => {
            if (testedConnection.status === Enum.StatusIntegracao.Erro) {
                return Promise.reject({
                    code: "SUPABASE_CONEXAO_INVALIDA",
                    message: testedConnection.erro ?? "A conexão Supabase apresentou um erro.",
                })
            }

            return testedConnection
        })

        toast.promise(testPromise, {
            loading: "Testando conexão Supabase...",
            success: "Conexão Supabase validada.",
            error: (error) => normalizarErroSupabase(error).message,
        })
    }

    const remove = () => {
        toast.promise(removeConnection(), {
            loading: "Removendo conexão Supabase...",
            success: () => {
                resetForm()
                setModal("removerConexao", { open: false })
                return "Conexão e token Supabase removidos."
            },
            error: (error) => normalizarErroSupabase(error).message,
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
