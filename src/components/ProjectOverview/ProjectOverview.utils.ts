import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export const ProjectStatusDetails = (projeto: ObterProjetos.Projeto) => ({
    online: projeto.servicos.filter((servico) => servico.status === Enum.StatusProjeto.Saudavel).length,
    offline: projeto.servicos.filter((servico) => servico.status === Enum.StatusProjeto.Offline).length,
    disponibilidadeMedia:
        projeto.disponibilidade.reduce((total, valor) => total + valor, 0) /
        Math.max(projeto.disponibilidade.length, 1),
    respostaMedia:
        projeto.tempoResposta.reduce((total, valor) => total + valor, 0) /
        Math.max(projeto.tempoResposta.length, 1),
})
