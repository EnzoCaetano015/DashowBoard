import { useState } from "react"
import { toast } from "sonner"

import type { EtapaNovoProjeto } from "@/components/NewProjectDialog/NewProjectDialog.types"

export const useNewProjectDialog = () => {
    const [aberto, setAberto] = useState(false)
    const [etapa, setEtapa] = useState<EtapaNovoProjeto>(1)
    const [repositorios, setRepositorios] = useState<string[]>([])
    const [servicos, setServicos] = useState<string[]>([])

    const alternar = (id: string, valores: string[], definir: (novos: string[]) => void) => {
        definir(valores.includes(id) ? valores.filter((valor) => valor !== id) : [...valores, id])
    }

    const voltar = () => setEtapa((valor) => Math.max(1, valor - 1) as EtapaNovoProjeto)
    const continuar = () => setEtapa((valor) => Math.min(5, valor + 1) as EtapaNovoProjeto)
    const alterarAberto = (valor: boolean) => {
        setAberto(valor)
        if (!valor) setEtapa(1)
    }
    const concluir = () => {
        alterarAberto(false)
        toast.success("Projeto mockado criado com sucesso.", {
            description: "Nenhum dado foi persistido nesta fase.",
        })
    }

    return {
        aberto,
        etapa,
        repositorios,
        servicos,
        alterarAberto,
        voltar,
        continuar,
        concluir,
        alternarRepositorio: (id: string) => alternar(id, repositorios, setRepositorios),
        alternarServico: (id: string) => alternar(id, servicos, setServicos),
    }
}
