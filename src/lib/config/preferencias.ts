import { Enum } from "@/backend/api/enums/enum"
import type { ObterIncidentes } from "@/backend/api/models/incidente.types"
import type { PreferenciasAplicacao } from "@/backend/api/models/preferencias.types"

export const PREFERENCIAS_PADRAO: PreferenciasAplicacao = {
    iniciarComSistema: false,
    verificacaoSegundoPlano: true,
    intervaloPadraoSegundos: Enum.IntervaloAtualizacao.TrintaSegundos,
    notificacoesSistema: false,
    somIncidente: false,
    badgeIcone: true,
    tema: Enum.TemaAplicacao.Escuro,
    densidade: Enum.DensidadeAplicacao.Confortavel,
    nomeDesenvolvedor: "",
    sidebarCompacta: false,
}

export const resolverTemaAplicacao = (
    tema: Enum.TemaAplicacao,
    sistemaEscuro: boolean
): Enum.TemaAplicacao.Claro | Enum.TemaAplicacao.Escuro => {
    if (tema === Enum.TemaAplicacao.Sistema) {
        return sistemaEscuro ? Enum.TemaAplicacao.Escuro : Enum.TemaAplicacao.Claro
    }

    return tema
}

export const obterIncidentesAtivos = (incidentes: ObterIncidentes.Incidente[]) => {
    return incidentes.filter((incidente) => incidente.status !== Enum.StatusIncidente.Resolvido)
}
