export type ErrosInformacoesProjeto = {
    nome?: string
    urlAplicacao?: string
}

export const validarInformacoesProjeto = (informacoes: {
    nome: string
    urlAplicacao: string
}): ErrosInformacoesProjeto => {
    const erros: ErrosInformacoesProjeto = {}
    if (!informacoes.nome.trim()) erros.nome = "Enter a project name."

    const url = informacoes.urlAplicacao.trim()
    if (url) {
        try {
            const protocolo = new URL(url).protocol
            if (protocolo !== "http:" && protocolo !== "https:") {
                erros.urlAplicacao = "Use a complete URL starting with http:// or https://."
            }
        } catch {
            erros.urlAplicacao = "Enter a valid application URL."
        }
    }
    return erros
}
