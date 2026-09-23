export type CategoriaResultadoBuscaGlobal = "projeto" | "servico" | "repositorio"

export type ResultadoBuscaGlobal = {
    id: string
    categoria: CategoriaResultadoBuscaGlobal
    projetoId: string
    titulo: string
    descricao: string
    destino: string
}
