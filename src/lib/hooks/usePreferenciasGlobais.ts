import { useEffect, useRef, useSyncExternalStore } from "react"

import { Enum } from "@/backend/api/enums/enum"
import { useObterPreferencias } from "@/backend/api/controllers/preferencias"
import { IncidenteQueryKeys, type ObterIncidentes } from "@/backend/api/models/incidente.types"
import {
    aplicarTemaDesktop,
    enviarNotificacaoSistema,
    sincronizarBadgeDesktop,
} from "@/lib/config/desktop"
import {
    obterIncidentesAtivos,
    PREFERENCIAS_PADRAO,
    resolverTemaAplicacao,
} from "@/lib/config/preferencias"
import { queryClient } from "@/lib/config/query-client"

const consultaTemaEscuroDoSistema = () => window.matchMedia("(prefers-color-scheme: dark)")

const assinarTemaDoSistema = (notificarMudanca: () => void) => {
    const consulta = consultaTemaEscuroDoSistema()
    consulta.addEventListener("change", notificarMudanca)
    return () => consulta.removeEventListener("change", notificarMudanca)
}

const obterTemaEscuroDoSistema = () => consultaTemaEscuroDoSistema().matches

export const usePreferenciasGlobais = () => {
    const { data: preferencias = PREFERENCIAS_PADRAO } = useObterPreferencias()
    const sistemaEscuro = useSyncExternalStore(assinarTemaDoSistema, obterTemaEscuroDoSistema)
    const incidentesConhecidos = useRef<Set<string> | null>(null)
    const temaEfetivo = resolverTemaAplicacao(preferencias.tema, sistemaEscuro)

    useEffect(() => {
        const elemento = document.documentElement
        elemento.classList.toggle("dark", temaEfetivo === Enum.TemaAplicacao.Escuro)
        elemento.dataset.density = preferencias.densidade
        elemento.style.colorScheme = temaEfetivo

        void aplicarTemaDesktop(preferencias.tema).catch(() => undefined)
    }, [preferencias.densidade, preferencias.tema, temaEfetivo])

    useEffect(() => {
        const sincronizarIncidentes = () => {
            const incidentes = queryClient.getQueryData<ObterIncidentes.Response>([
                IncidenteQueryKeys.ObterIncidentes,
            ])

            if (!incidentes) {
                if (!preferencias.badgeIcone) {
                    void sincronizarBadgeDesktop(0, false).catch(() => undefined)
                }
                return
            }

            const ativos = obterIncidentesAtivos(incidentes)
            void sincronizarBadgeDesktop(ativos.length, preferencias.badgeIcone).catch(() => undefined)

            const idsAtuais = new Set(incidentes.map(({ id }) => id))
            if (incidentesConhecidos.current === null) {
                incidentesConhecidos.current = idsAtuais
                return
            }

            if (preferencias.notificacoesSistema) {
                for (const incidente of ativos) {
                    if (incidentesConhecidos.current.has(incidente.id)) continue

                    void enviarNotificacaoSistema(
                        incidente.projetoNome,
                        incidente.titulo,
                        preferencias.somIncidente
                    ).catch(() => undefined)
                }
            }

            incidentesConhecidos.current = idsAtuais
        }

        sincronizarIncidentes()
        return queryClient.getQueryCache().subscribe(sincronizarIncidentes)
    }, [preferencias.badgeIcone, preferencias.notificacoesSistema, preferencias.somIncidente])

    return {
        temaEfetivo,
    }
}
