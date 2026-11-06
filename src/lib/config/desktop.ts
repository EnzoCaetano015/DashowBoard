import { Enum } from "@/backend/api/enums/enum"
import { obterCaminhoBancoDados } from "@/backend/sql/database"
import { exigirRuntimeTauri, possuiRuntimeTauri } from "@/lib/utils/tauri"

export const configurarInicializacaoComSistema = async (ativo: boolean) => {
    exigirRuntimeTauri()

    const { disable, enable, isEnabled } = await import("@tauri-apps/plugin-autostart")
    const estadoAtual = await isEnabled()

    if (ativo === estadoAtual) return
    await (ativo ? enable() : disable())
}

export const obterInicializacaoComSistema = async () => {
    exigirRuntimeTauri()

    const { isEnabled } = await import("@tauri-apps/plugin-autostart")
    return isEnabled()
}

export const notificacoesDoSistemaPermitidas = async () => {
    exigirRuntimeTauri()

    const { isPermissionGranted } = await import("@tauri-apps/plugin-notification")
    return isPermissionGranted()
}

export const garantirPermissaoNotificacoes = async () => {
    exigirRuntimeTauri()

    const { requestPermission } = await import("@tauri-apps/plugin-notification")

    if (await notificacoesDoSistemaPermitidas()) return

    const permissao = await requestPermission()
    if (permissao !== "granted") {
        throw new Error("Notification permission was not granted by the operating system.")
    }
}

export const enviarNotificacaoSistema = async (titulo: string, mensagem: string, somAtivo: boolean) => {
    if (!possuiRuntimeTauri()) return

    await garantirPermissaoNotificacoes()
    const { sendNotification } = await import("@tauri-apps/plugin-notification")
    sendNotification({
        title: titulo,
        body: mensagem,
        silent: !somAtivo,
    })
}

export const aplicarTemaDesktop = async (tema: Enum.TemaAplicacao) => {
    if (!possuiRuntimeTauri()) return

    const { setTheme } = await import("@tauri-apps/api/app")
    await setTheme(tema === Enum.TemaAplicacao.Sistema ? null : tema)
}

const criarIconeBadgeWindows = async (quantidade: number) => {
    const tamanho = 32
    const canvas = document.createElement("canvas")
    const contexto = canvas.getContext("2d")

    if (!contexto) throw new Error("Unable to create the app badge.")

    canvas.width = tamanho
    canvas.height = tamanho

    const estilos = getComputedStyle(document.documentElement)
    contexto.fillStyle = estilos.getPropertyValue("--primary").trim()
    contexto.beginPath()
    contexto.arc(tamanho / 2, tamanho / 2, tamanho / 2, 0, Math.PI * 2)
    contexto.fill()

    const texto = quantidade > 99 ? "99+" : String(quantidade)
    contexto.fillStyle = estilos.getPropertyValue("--primary-foreground").trim()
    contexto.font = `600 ${texto.length > 2 ? 11 : 15}px Geist Variable, sans-serif`
    contexto.textAlign = "center"
    contexto.textBaseline = "middle"
    contexto.fillText(texto, tamanho / 2, tamanho / 2 + 1)

    const imagem = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((resultado) => {
            if (resultado) {
                resolve(resultado)
                return
            }

            reject(new Error("Unable to generate the app badge."))
        }, "image/png")
    })

    return new Uint8Array(await imagem.arrayBuffer())
}

export const sincronizarBadgeDesktop = async (quantidade: number, habilitado: boolean) => {
    if (!possuiRuntimeTauri()) return

    const { getCurrentWindow } = await import("@tauri-apps/api/window")
    const janela = getCurrentWindow()

    if (navigator.userAgent.includes("Windows")) {
        await janela.setOverlayIcon(
            habilitado && quantidade > 0 ? await criarIconeBadgeWindows(quantidade) : undefined
        )
        return
    }

    await janela.setBadgeCount(habilitado && quantidade > 0 ? quantidade : undefined)
}

export const obterInformacoesDesktop = async () => {
    if (!possuiRuntimeTauri()) {
        return {
            caminhoBanco: "Available in the desktop app",
            versao: "0.1.0",
            runtime: "Navegador",
            build: import.meta.env.DEV ? "dev-web" : "release-web",
        }
    }

    const [{ getTauriVersion, getVersion }, caminhoBanco] = await Promise.all([
        import("@tauri-apps/api/app"),
        obterCaminhoBancoDados(),
    ])
    const [versao, versaoTauri] = await Promise.all([getVersion(), getTauriVersion()])

    return {
        caminhoBanco,
        versao,
        runtime: `Tauri ${versaoTauri}`,
        build: import.meta.env.DEV ? "dev-desktop" : "release-desktop",
    }
}
