import { useState } from "react"
import { toast } from "sonner"

import {
    useObterConexoesGitHub,
    useRemoverConexaoGitHub,
    useSalvarConexaoGitHub,
    useTestarConexaoGitHub,
} from "@/backend/api/controllers/github"
import { Enum } from "@/backend/api/enums/enum"
import type { ConexaoGitHub } from "@/backend/api/models/github.types"
import { normalizarErroGitHub } from "@/lib/utils/github"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useGitHubIntegrationDialog = () => {
    const [formVisible, setFormVisible] = useState(false)
    const [connectionId, setConnectionId] = useState<string>()
    const [nome, setNome] = useState("")
    const [tipo, setTipo] = useState(Enum.TipoConexaoGitHub.Pessoal)
    const [resourceOwner, setResourceOwner] = useState("")
    const [token, setToken] = useState("")
    const connections = useObterConexoesGitHub()
    const saveConnection = useSalvarConexaoGitHub()
    const testConnection = useTestarConexaoGitHub()
    const removeConnection = useRemoverConexaoGitHub()

    const resetForm = () => {
        setFormVisible(false)
        setConnectionId(undefined)
        setNome("")
        setTipo(Enum.TipoConexaoGitHub.Pessoal)
        setResourceOwner("")
        setToken("")
    }

    const startNew = () => {
        resetForm()
        setFormVisible(true)
    }

    const startUpdate = (connection: ConexaoGitHub) => {
        setConnectionId(connection.id)
        setNome(connection.nome)
        setTipo(connection.tipo)
        setResourceOwner(connection.resourceOwner)
        setToken("")
        setFormVisible(true)
    }

    const save = async () => {
        if (!nome.trim() || !resourceOwner.trim() || !token.trim()) {
            toast.error("Preencha nome, resource owner e token.")
            return
        }
        try {
            await saveConnection.mutateAsync({
                connectionId,
                nome,
                tipo,
                resourceOwner,
                token,
            })
            resetForm()
            toast.success(connectionId ? "Conexão atualizada." : "Conexão GitHub adicionada.")
        } catch (error) {
            toast.error(normalizarErroGitHub(error).message)
        }
    }

    const test = async (id: string) => {
        try {
            const connection = await testConnection.mutateAsync({ connectionId: id })
            if (connection.status === Enum.StatusIntegracao.Erro) {
                toast.error(connection.erro ?? "A conexão apresentou um erro.")
                return
            }
            toast.success(`Conexão ${connection.nome} validada.`)
        } catch (error) {
            toast.error(normalizarErroGitHub(error).message)
        }
    }

    const remove = async (id: string) => {
        try {
            await removeConnection.mutateAsync({ connectionId: id })
            if (connectionId === id) resetForm()
            toast.success("Conexão e token removidos.")
        } catch (error) {
            toast.error(normalizarErroGitHub(error).message)
        }
    }

    return {
        runtimeDisponivel: possuiRuntimeTauri(),
        connections: connections.data ?? [],
        isLoading: connections.isLoading,
        isError: connections.isError,
        error: connections.error,
        isPending:
            saveConnection.isPending || testConnection.isPending || removeConnection.isPending,
        formVisible,
        connectionId,
        nome,
        tipo,
        resourceOwner,
        token,
        setNome,
        setTipo,
        setResourceOwner,
        setToken,
        startNew,
        startUpdate,
        resetForm,
        save,
        test,
        remove,
        retry: connections.refetch,
    }
}
