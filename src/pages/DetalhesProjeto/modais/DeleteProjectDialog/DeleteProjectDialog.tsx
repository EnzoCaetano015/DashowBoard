import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"
import { useDeleteProjectDialog } from "@/pages/DetalhesProjeto/modais/DeleteProjectDialog/DeleteProjectDialog.hook"
import type { DeleteProjectDialogProps } from "@/pages/DetalhesProjeto/modais/DeleteProjectDialog/DeleteProjectDialog.types"

export const DeleteProjectDialog = ({
    open,
    onClose,
    projetoId,
    nomeProjeto,
}: DeleteProjectDialogProps) => {
    const { excluirProjetoIsPending, excluir } = useDeleteProjectDialog(projetoId, onClose)

    return (
        <Modal.Content
            open={open}
            onClose={onClose}
            className="border-border bg-card"
        >
            <Modal.Header
                titulo="Delete project"
                subTitulo={`You are about to remove the local group ${nomeProjeto}.`}
            />
            <Modal.Body>
                <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
                    This <strong>does not</strong> delete GitHub repositories, Vercel projects, Railway services, or Supabase databases. Only the local DashowBoard link is removed.
                </div>
            </Modal.Body>
            <Modal.Actions>
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={excluirProjetoIsPending}
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => void excluir()}
                    disabled={excluirProjetoIsPending}
                >
                    {excluirProjetoIsPending ? "Deleting..." : "Delete group"}
                </Button>
            </Modal.Actions>
        </Modal.Content>
    )
}
