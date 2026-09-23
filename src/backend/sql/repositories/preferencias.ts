import { Enum } from "@/backend/api/enums/enum"
import type { ObterPreferencias, SalvarPreferencias } from "@/backend/api/models/preferencias.types"
import { obterBancoDados } from "@/backend/sql/database"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"

type PreferenciasRow = {
    iniciarComSistema: number
    verificacaoSegundoPlano: number
    intervaloPadraoSegundos: number
    notificacoesSistema: number
    somIncidente: number
    badgeIcone: number
    tema: string
    densidade: string
    nomeDesenvolvedor: string
    sidebarCompacta: number
}

const ehTemaAplicacao = (tema: string): tema is Enum.TemaAplicacao => {
    return Object.values(Enum.TemaAplicacao).some((valor) => valor === tema)
}

const ehDensidadeAplicacao = (densidade: string): densidade is Enum.DensidadeAplicacao => {
    return Object.values(Enum.DensidadeAplicacao).some((valor) => valor === densidade)
}

const ehIntervaloAtualizacao = (intervalo: number): intervalo is Enum.IntervaloAtualizacao => {
    return Object.values(Enum.IntervaloAtualizacao).some((valor) => valor === intervalo)
}

export const obterPreferencias = async (): Promise<ObterPreferencias.Response> => {
    const database = await obterBancoDados()
    const [preferencias] = await database.select<PreferenciasRow[]>(`
        SELECT
            iniciar_com_sistema AS iniciarComSistema,
            verificacao_segundo_plano AS verificacaoSegundoPlano,
            intervalo_padrao_segundos AS intervaloPadraoSegundos,
            notificacoes_sistema AS notificacoesSistema,
            som_incidente AS somIncidente,
            badge_icone AS badgeIcone,
            tema,
            densidade,
            nome_desenvolvedor AS nomeDesenvolvedor,
            sidebar_compacta AS sidebarCompacta
        FROM preferencias_aplicacao
        WHERE id = 1
    `)

    if (!preferencias) return PREFERENCIAS_PADRAO

    return {
        iniciarComSistema: preferencias.iniciarComSistema === 1,
        verificacaoSegundoPlano: preferencias.verificacaoSegundoPlano === 1,
        intervaloPadraoSegundos: ehIntervaloAtualizacao(preferencias.intervaloPadraoSegundos)
            ? preferencias.intervaloPadraoSegundos
            : PREFERENCIAS_PADRAO.intervaloPadraoSegundos,
        notificacoesSistema: preferencias.notificacoesSistema === 1,
        somIncidente: preferencias.somIncidente === 1,
        badgeIcone: preferencias.badgeIcone === 1,
        tema: ehTemaAplicacao(preferencias.tema) ? preferencias.tema : PREFERENCIAS_PADRAO.tema,
        densidade: ehDensidadeAplicacao(preferencias.densidade)
            ? preferencias.densidade
            : PREFERENCIAS_PADRAO.densidade,
        nomeDesenvolvedor: preferencias.nomeDesenvolvedor,
        sidebarCompacta: preferencias.sidebarCompacta === 1,
    }
}

export const salvarPreferencias = async (
    request: SalvarPreferencias.Request
): Promise<SalvarPreferencias.Response> => {
    const database = await obterBancoDados()

    await database.execute(
        `
            UPDATE preferencias_aplicacao
            SET
                iniciar_com_sistema = $1,
                verificacao_segundo_plano = $2,
                intervalo_padrao_segundos = $3,
                notificacoes_sistema = $4,
                som_incidente = $5,
                badge_icone = $6,
                tema = $7,
                densidade = $8,
                nome_desenvolvedor = $9,
                sidebar_compacta = $10,
                atualizado_em = $11
            WHERE id = 1
        `,
        [
            Number(request.iniciarComSistema),
            Number(request.verificacaoSegundoPlano),
            request.intervaloPadraoSegundos,
            Number(request.notificacoesSistema),
            Number(request.somIncidente),
            Number(request.badgeIcone),
            request.tema,
            request.densidade,
            request.nomeDesenvolvedor,
            Number(request.sidebarCompacta),
            new Date().toISOString(),
        ]
    )

    return request
}
