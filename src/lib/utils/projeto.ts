export type ErrosInformacoesProjeto = {
    nome?: string
    urlAplicacao?: string
}

export const validarInformacoesProjeto = (informacoes: {
    nome: string
    urlAplicacao: string
}): ErrosInformacoesProjeto => {
    const erros: ErrosInformacoesProjeto = {}
    if (!informacoes.nome.trim()) erros.nome = "Informe o nome do projeto."

    const url = informacoes.urlAplicacao.trim()
    if (url) {
        try {
            const protocolo = new URL(url).protocol
            if (protocolo !== "http:" && protocolo !== "https:") {
                erros.urlAplicacao = "Use uma URL completa iniciada por http:// ou https://."
            }
        } catch {
            erros.urlAplicacao = "Informe uma URL válida para a aplicação."
        }
    }
    return erros
}
