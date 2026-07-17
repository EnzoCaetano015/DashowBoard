import { Enum } from "@/backend/api/enums/enum"
import type { ObterProjetos } from "@/backend/api/models/projeto.types"

export const ProjectStatusDetails = (projeto: ObterProjetos.Projeto) => ({
    online: projeto.servicos.filter((servico) => servico.status === Enum.StatusProjeto.Saudavel).length,
    offline: projeto.servicos.filter((servico) => servico.status === Enum.StatusProjeto.Offline).length,
    disponibilidadeMedia:
        projeto.disponibilidade.length > 0
            ? projeto.disponibilidade.reduce((total, valor) => total + valor, 0) /
              projeto.disponibilidade.length
            : null,
    respostaMedia:
        projeto.tempoResposta.length > 0
            ? projeto.tempoResposta.reduce((total, valor) => total + valor, 0) /
              projeto.tempoResposta.length
            : null,
})
