import { useState } from "react"
import { toast } from "sonner"

import type { Preferencias } from "@/pages/Configuracoes/Configuracoes.types"
import { PREFERENCIAS_INICIAIS } from "@/pages/Configuracoes/Configuracoes.utils"

export const useConfiguracoes = () => {
    const [preferencias, setPreferencias] = useState(PREFERENCIAS_INICIAIS)
    const alterar = <C extends keyof Preferencias>(campo: C, valor: Preferencias[C]) =>
        setPreferencias((atuais) => ({ ...atuais, [campo]: valor }))

    return {
        preferencias,
        alterar,
        simular: (acao: string) => toast.info(`${acao} estará disponível com a persistência local.`),
    }
}
