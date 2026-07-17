import { toast } from "sonner"

import {
    useExportarBackupBancoDados,
    useObterInformacoesDesktop,
    useObterPreferencias,
    useRevelarBancoDados,
    useSalvarPreferencias,
} from "@/backend/api/controllers/preferencias"
import type { PreferenciasAplicacao } from "@/backend/api/models/preferencias.types"
import {
    configurarInicializacaoComSistema,
    enviarNotificacaoSistema,
    garantirPermissaoNotificacoes,
} from "@/lib/config/desktop"
import { PREFERENCIAS_PADRAO } from "@/lib/config/preferencias"
import {
    INFORMACOES_INICIAIS,
    obterMensagemErroConfiguracoes,
} from "@/pages/Configuracoes/Configuracoes.utils"

export const useConfiguracoes = () => {
    const { data: preferencias = PREFERENCIAS_PADRAO, isLoading: preferenciasIsLoading } =
        useObterPreferencias()

    const { data: informacoes = INFORMACOES_INICIAIS, isLoading: informacoesIsLoading } =
        useObterInformacoesDesktop()

    const { mutateAsync: salvarPreferencias, isPending: preferenciasIsPending } = useSalvarPreferencias()

    const { mutateAsync: revelarBancoDados, isPending: revelarBancoDadosIsPending } =
        useRevelarBancoDados()

    const { mutateAsync: exportarBackupBancoDados, isPending: exportarBackupIsPending } =
        useExportarBackupBancoDados()

    const alterar = <Campo extends keyof PreferenciasAplicacao>(
        campo: Campo,
        valor: PreferenciasAplicacao[Campo]
    ) => {
        if (preferencias[campo] === valor) return

        const atualizadas = { ...preferencias, [campo]: valor }

        const salvar = async () => {
            if (campo === "iniciarComSistema") {
                await configurarInicializacaoComSistema(Boolean(valor))
            }

            if (campo === "notificacoesSistema" && valor === true) {
                await garantirPermissaoNotificacoes()
            }

            await salvarPreferencias(atualizadas)
        }

        toast.promise(salvar(), {
            id: "salvar-preferencias-aplicacao",
            loading: "Salvando preferência...",
            success: () => {
                if (campo !== "notificacoesSistema" || valor !== true) {
                    return "Preferência atualizada."
                }

                toast.promise(
                    enviarNotificacaoSistema(
                        "DashwoBoard",
                        "Notificações do sistema ativadas.",
                        atualizadas.somIncidente
                    ),
                    {
                        loading: "Enviando notificação de teste...",
                        success: "Notificações do sistema ativadas.",
                        error: obterMensagemErroConfiguracoes,
                    }
                )

                return "Preferência atualizada."
            },
            error: (erro) => {
                if (campo === "iniciarComSistema") {
                    void configurarInicializacaoComSistema(preferencias.iniciarComSistema).catch(
                        () => undefined
                    )
                }

                return obterMensagemErroConfiguracoes(erro)
            },
        })
    }

    const abrirPasta = () => {
        toast.promise(revelarBancoDados(), {
            loading: "Abrindo pasta do banco de dados...",
            success: "Pasta do banco de dados aberta.",
            error: obterMensagemErroConfiguracoes,
        })
    }

    const exportarBackup = () => {
        toast.promise(exportarBackupBancoDados(), {
            loading: "Exportando backup...",
            success: "Backup exportado para a pasta de downloads.",
            error: obterMensagemErroConfiguracoes,
        })
    }

    return {
        preferencias,
        informacoes,
        alterar,
        abrirPasta,
        exportarBackup,
        armazenamentoIsPending: revelarBancoDadosIsPending || exportarBackupIsPending,
        preferenciasIsPending,
        preferenciasIsLoading: preferenciasIsLoading || informacoesIsLoading,
    }
}
