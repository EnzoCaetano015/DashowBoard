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
import { useControlModal } from "@/lib/hooks/useControlModal"
import { normalizarErroGitHub } from "@/lib/utils/github"
import { possuiRuntimeTauri } from "@/lib/utils/tauri"

export const useGitHubIntegrationDialog = () => {
    const { modal, setModal } = useControlModal(["removerConexao"] as const)
    const [formVisible, setFormVisible] = useState(false)
    const [connectionToRemove, setConnectionToRemove] = useState<ConexaoGitHub | null>(null)
    const [connectionId, setConnectionId] = useState<string>()
    const [nome, setNome] = useState("")
    const [tipo, setTipo] = useState(Enum.TipoConexaoGitHub.Pessoal)
    const [resourceOwner, setResourceOwner] = useState("")
    const [token, setToken] = useState("")
    const { data: connections = [], isLoading: connectionsIsLoading } = useObterConexoesGitHub()
    const { mutateAsync: saveConnection, isPending: saveConnectionIsPending } = useSalvarConexaoGitHub()
    const { mutateAsync: testConnection, isPending: testConnectionIsPending } = useTestarConexaoGitHub()
    const { mutateAsync: removeConnection, isPending: removeConnectionIsPending } =
        useRemoverConexaoGitHub()

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

    const save = () => {
        if (!nome.trim() || !resourceOwner.trim() || !token.trim()) {
            toast.error("Preencha nome, resource owner e token.")
            return
        }

        const updatingConnection = Boolean(connectionId)

        toast.promise(
            saveConnection({
                connectionId,
                nome: nome.trim(),
                tipo,
                resourceOwner: resourceOwner.trim(),
                token: token.trim(),
            }),
            {
                loading: updatingConnection
                    ? "Atualizando conexão GitHub..."
                    : "Adicionando conexão GitHub...",
                success: () => {
                    resetForm()
                    return updatingConnection ? "Conexão atualizada." : "Conexão GitHub adicionada."
                },
                error: (error) => normalizarErroGitHub(error).message,
            }
        )
    }

    const test = (id: string) => {
        const testPromise = testConnection({ connectionId: id }).then((connection) => {
            if (connection.status === Enum.StatusIntegracao.Erro) {
                return Promise.reject({
                    code: "GITHUB_CONEXAO_INVALIDA",
                    message: connection.erro ?? "A conexão apresentou um erro.",
                })
            }

            return connection
        })

        toast.promise(testPromise, {
            loading: "Testando conexão GitHub...",
            success: (connection) => `Conexão ${connection.nome} validada.`,
            error: (error) => normalizarErroGitHub(error).message,
        })
    }

    const startRemove = (connection: ConexaoGitHub) => {
        setConnectionToRemove(connection)
        setModal("removerConexao", { open: true })
    }

    const cancelRemove = () => {
        if (removeConnectionIsPending) return
        setModal("removerConexao", { open: false })
        setConnectionToRemove(null)
    }

    const remove = () => {
        if (!connectionToRemove) return

        const connection = connectionToRemove

        toast.promise(removeConnection({ connectionId: connection.id }), {
            loading: "Removendo conexão GitHub...",
            success: () => {
                if (connectionId === connection.id) resetForm()
                setModal("removerConexao", { open: false })
                setConnectionToRemove(null)
                return "Conexão e token removidos."
            },
            error: (error) => normalizarErroGitHub(error).message,
        })
    }

    return {
        modal,
        runtimeDisponivel: possuiRuntimeTauri(),
        connections,
        isLoading: connectionsIsLoading,
        isPending: saveConnectionIsPending || testConnectionIsPending || removeConnectionIsPending,
        removeIsPending: removeConnectionIsPending,
        connectionToRemove,
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
        startRemove,
        cancelRemove,
        remove,
    }
}
