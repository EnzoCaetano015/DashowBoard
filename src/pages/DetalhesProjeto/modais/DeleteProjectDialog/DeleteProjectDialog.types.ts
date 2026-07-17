import type { ModalControlProps } from "@/lib/types/modal"

export type DeleteProjectDialogProps = ModalControlProps & {
    projetoId: string
    nomeProjeto: string
}
