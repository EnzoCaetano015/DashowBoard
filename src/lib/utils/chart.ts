import type { ResumoSerie } from "@/lib/types/chart"

export const resumirSerie = (dados: number[]): ResumoSerie | null => {
    if (dados.length === 0) return null

    let minimo = dados[0]
    let maximo = dados[0]
    let total = 0

    for (const valor of dados) {
        minimo = Math.min(minimo, valor)
        maximo = Math.max(maximo, valor)
        total += valor
    }

    return {
        minimo,
        maximo,
        media: total / dados.length,
        ultimo: dados[dados.length - 1],
        quantidade: dados.length,
    }
}

export const formatarValorSerie = (valor: number, unidade: string) => {
    const valorFormatado = Number.isInteger(valor)
        ? valor.toLocaleString("pt-BR")
        : valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })

    return unidade === "%" ? `${valorFormatado}%` : `${valorFormatado}${unidade ? ` ${unidade}` : ""}`
}
