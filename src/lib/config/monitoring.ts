import type { PreferenciasAplicacao } from "@/backend/api/models/preferencias.types"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"
import type { PeriodoMonitoramento } from "@/lib/types/monitoring"

export const PERIODOS_MONITORAMENTO: PeriodoMonitoramento[] = [5, 15, 30]

export const TEMPO_CACHE_REPOSITORIOS_GITHUB = 1000 * 60 * 5
export const TEMPO_CACHE_PROJETOS_VERCEL = 1000 * 60 * 5
export const TEMPO_CACHE_PROJETOS_RAILWAY = 1000 * 60 * 2
export const INTERVALO_ATUALIZACAO_RAILWAY = 1000 * 60 * 5

export const obterConfiguracaoMonitoramento = (preferencias?: PreferenciasAplicacao) => {
    const configuracao = preferencias ?? PREFERENCIAS_PADRAO

    return {
        intervaloAtualizacao: configuracao.intervaloPadraoSegundos * 1000,
        verificacaoSegundoPlano: configuracao.verificacaoSegundoPlano,
    }
}
