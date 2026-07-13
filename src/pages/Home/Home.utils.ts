import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type { FiltrosHome } from "@/pages/Home/Home.types"

export const FILTROS_HOME_INICIAIS: FiltrosHome = {
    busca: "",
    status: "todos",
    provider: "todos",
    tipoServico: "todos",
    tagRepositorio: "todos",
}

export const filtrarProjetos = (projetos: ObterProjetos.Projeto[], filtros: FiltrosHome) => {
    const busca = filtros.busca.trim().toLocaleLowerCase("pt-BR")

    return projetos.filter((projeto) => {
        if (busca && !`${projeto.nome} ${projeto.descricao}`.toLocaleLowerCase("pt-BR").includes(busca))
            return false
        if (filtros.status !== "todos" && projeto.status !== filtros.status) return false
        if (filtros.provider !== "todos" && !projeto.providers.includes(filtros.provider)) return false
        if (
            filtros.tipoServico !== "todos" &&
            !projeto.servicos.some((servico) => servico.tipo === filtros.tipoServico)
        )
            return false
        const tagRepositorio = filtros.tagRepositorio
        if (
            tagRepositorio !== "todos" &&
            !projeto.repositorios.some((repositorio) => repositorio.tags.includes(tagRepositorio))
        )
            return false
        return true
    })
}
