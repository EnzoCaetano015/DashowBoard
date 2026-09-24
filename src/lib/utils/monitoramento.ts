import { Enum } from "@/backend/api/enums/enum"
import type { SalvarSnapshotsServicos } from "@/backend/api/models/projeto.types"
import { obterMensagemErro } from "@/lib/utils/error"

type RecursoMonitorado = {
    status: Enum.StatusProjeto
    snapshot: unknown
}

type ResolverAtualizacaoMonitoramentoRequest = {
    servicoId: string
    coletaConcluida: boolean
    recurso?: RecursoMonitorado
    erro?: unknown
    mensagemFalhaParcial?: string | null
}

export const resolverAtualizacaoMonitoramento = ({
    servicoId,
    coletaConcluida,
    recurso,
    erro,
    mensagemFalhaParcial,
}: ResolverAtualizacaoMonitoramentoRequest): SalvarSnapshotsServicos.Atualizacao | null => {
    if (!coletaConcluida) return null
    if (erro) {
        return {
            servicoId,
            status: Enum.StatusProjeto.Desconhecido,
            mensagemStatus: obterMensagemErro(erro, "Não foi possível consultar o provider."),
        }
    }
    if (recurso) {
        return {
            servicoId,
            status: recurso.status,
            snapshot: recurso.snapshot,
            mensagemStatus: null,
        }
    }
    return {
        servicoId,
        status: Enum.StatusProjeto.Desconhecido,
        mensagemStatus: mensagemFalhaParcial ?? "Recurso não localizado no provider.",
    }
}
