import { invoke } from "@tauri-apps/api/core"

import type { VerificarHealthCheckProjeto } from "@/backend/api/models/health-check.types"
import { exigirRuntimeTauri } from "@/lib/utils/tauri"

export const verificarHealthCheckProjeto = async (
    request: VerificarHealthCheckProjeto.Request
): Promise<VerificarHealthCheckProjeto.Response> => {
    exigirRuntimeTauri("Health check")
    return invoke("verificar_health_check_projeto", {
        request: {
            url: request.url,
            timeoutSegundos: request.timeoutSegundos,
        },
    })
}
