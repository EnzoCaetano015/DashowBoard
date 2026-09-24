import type { Enum } from "@/backend/api/enums/enum"

export enum HealthCheckQueryKeys {
    VerificarProjeto = "verificar-health-check-projeto",
}

export namespace VerificarHealthCheckProjeto {
    export type Request = {
        projetoId: string
        url: string
        timeoutSegundos: number
    }

    export type Response = {
        status: Enum.StatusProjeto
        statusHttp: number | null
        tempoRespostaMs: number | null
        mensagem: string | null
        verificadoEm: string
    }
}
