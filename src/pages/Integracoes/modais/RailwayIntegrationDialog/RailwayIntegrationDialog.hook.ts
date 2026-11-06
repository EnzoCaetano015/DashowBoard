import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexaoRailway,
    useRemoverConexaoRailway,
    useSalvarConexaoRailway,
    useTestarConexaoRailway,
} from "@/backend/api/controllers/railway"
import { Enum } from "@/backend/api/enums/enum"
import { useControlModal } from "@/lib/hooks/useControlModal"
import { normalizarErroRailway } from "@/lib/utils/railway"
import { abrirUrlExterna, possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useRailwayIntegrationDialog = () => {
    const { modal, setModal } = useControlModal(["removerConexao"] as const)
    const [token, setToken] = useState("")
    const [formVisible, setFormVisible] = useState(false)
    const { data: connection, isLoading: connectionIsLoading } = useObterConexaoRailway()
    const { mutateAsync: saveConnection, isPending: saveConnectionIsPending } = useSalvarConexaoRailway()
    const { mutateAsync: testConnection, isPending: testConnectionIsPending } = useTestarConexaoRailway()
    const { mutateAsync: removeConnection, isPending: removeConnectionIsPending } =
        useRemoverConexaoRailway()

    const resetForm = () => {
        setToken("")
        setFormVisible(false)
    }

    const save = () => {
        if (!token.trim()) {
            toast.error("Enter your Railway Account Token.")
            return
        }
        toast.promise(saveConnection({ token: token.trim() }), {
            loading: connection ? "Replacing Railway token..." : "Connecting to Railway...",
            success: () => {
                resetForm()
                return connection ? "Railway token replaced." : "Railway connected."
            },
            error: (error) => normalizarErroRailway(error).message,
        })
    }

    const test = () => {
        const promise = testConnection().then((testedConnection) => {
            if (testedConnection.status === Enum.StatusIntegracao.Erro) {
                return Promise.reject({
                    code: testedConnection.erroCodigo ?? "RAILWAY_ERRO_DESCONHECIDO",
                    message: testedConnection.erro ?? "The Railway connection returned an error.",
                })
            }
            return testedConnection
        })
        toast.promise(promise, {
            loading: "Testing Railway connection...",
            success: "Railway connection validated.",
            error: (error) => normalizarErroRailway(error).message,
        })
    }

    const remove = () => {
        toast.promise(removeConnection(), {
            loading: "Removing Railway connection...",
            success: () => {
                resetForm()
                setModal("removerConexao", { open: false })
                return "Railway connection and token removed."
            },
            error: (error) => normalizarErroRailway(error).message,
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
        showForm: !connection || formVisible,
        setToken,
        startUpdate: () => setFormVisible(true),
        resetForm,
        save,
        test,
        openTokens: () => abrirUrlExterna("https://railway.com/account/tokens"),
        startRemove: () => setModal("removerConexao", { open: true }),
        cancelRemove: () => {
            if (!removeConnectionIsPending) setModal("removerConexao", { open: false })
        },
        remove,
    }
}
