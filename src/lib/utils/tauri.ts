export const possuiRuntimeTauri = () => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export const exigirRuntimeTauri = (provider?: string) => {
    if (!possuiRuntimeTauri()) {
        throw {
            code: "TAURI_NAO_DISPONIVEL",
            message: provider
                ? `The integration ${provider} is available in the desktop app.`
                : "This integration is available in the desktop app.",
        }
    }
}

export const abrirUrlExterna = async (url: string) => {
    if (possuiRuntimeTauri()) {
        const { openUrl } = await import("@tauri-apps/plugin-opener")
        await openUrl(url)
        return
    }
    window.open(url, "_blank", "noopener,noreferrer")
}
