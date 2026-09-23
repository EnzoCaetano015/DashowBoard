import type { ObterProjetos } from "@/backend/api/models/projeto.types"
import type {
    CategoriaResultadoBuscaGlobal,
    ResultadoBuscaGlobal,
} from "@/components/TopBar/TopBar.types"
import { labelProvider } from "@/lib/utils/status"
import { normalizarTextoBusca } from "@/lib/utils/text"

export const LABEL_CATEGORIA_BUSCA: Record<CategoriaResultadoBuscaGlobal, string> = {
    projeto: "Projetos",
    servico: "Serviços",
    repositorio: "Repositórios",
}

const ORDEM_CATEGORIA: Record<CategoriaResultadoBuscaGlobal, number> = {
    projeto: 0,
    servico: 1,
    repositorio: 2,
}

const corresponde = (termo: string, ...valores: Array<string | null | undefined>) =>
    valores.some((valor) => valor && normalizarTextoBusca(valor).includes(termo))

export const buscarResultadosGlobais = (
    projetos: ObterProjetos.Projeto[],
    busca: string
): ResultadoBuscaGlobal[] => {
    const termo = normalizarTextoBusca(busca.trim())
    if (!termo) return []

    const resultados: ResultadoBuscaGlobal[] = []

    for (const projeto of projetos) {
        if (corresponde(termo, projeto.nome, projeto.descricao, projeto.id)) {
            resultados.push({
                id: `projeto-${projeto.id}`,
                categoria: "projeto",
                projetoId: projeto.id,
                titulo: projeto.nome,
                descricao: projeto.descricao || "Projeto local",
                destino: `/projetos/${projeto.id}`,
            })
        }

        for (const servico of projeto.servicos) {
            if (
                corresponde(
                    termo,
                    servico.nome,
                    servico.id,
                    servico.externalProjectId,
                    servico.externalEnvironmentId,
                    servico.externalServiceId,
                    servico.scopeId,
                    servico.provider,
                    labelProvider[servico.provider],
                    servico.tipo
                )
            ) {
                resultados.push({
                    id: `servico-${servico.id}`,
                    categoria: "servico",
                    projetoId: projeto.id,
                    titulo: servico.nome,
                    descricao: `${projeto.nome} · ${labelProvider[servico.provider]} · ${servico.tipo}`,
                    destino: `/projetos/${projeto.id}?aba=servicos`,
                })
            }
        }

        for (const repositorio of projeto.repositorios) {
            if (
                corresponde(
                    termo,
                    repositorio.nome,
                    repositorio.fullName,
                    repositorio.descricao,
                    repositorio.externalId
                )
            ) {
                resultados.push({
                    id: `repositorio-${repositorio.id}`,
                    categoria: "repositorio",
                    projetoId: projeto.id,
                    titulo: repositorio.fullName || repositorio.nome,
                    descricao: `${projeto.nome} · ${repositorio.descricao || "Sem descrição"}`,
                    destino: `/projetos/${projeto.id}?aba=repositorios`,
                })
            }
        }
    }

    return resultados
        .sort(
            (primeiro, segundo) =>
                ORDEM_CATEGORIA[primeiro.categoria] - ORDEM_CATEGORIA[segundo.categoria]
        )
        .slice(0, 8)
}
