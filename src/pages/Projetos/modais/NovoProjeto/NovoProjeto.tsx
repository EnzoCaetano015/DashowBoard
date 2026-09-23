import { NovoProjetoConteudo } from "@/components/NovoProjeto/NovoProjetoConteudo"
import type { ModalControlProps } from "@/lib/types/modal"

export const NovoProjeto = ({ open, onClose }: ModalControlProps) => (
    <NovoProjetoConteudo
        open={open}
        onClose={onClose}
    />
)
