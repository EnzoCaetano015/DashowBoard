export const possuiRuntimeTauri = () => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export const exigirRuntimeTauri = (provider?: string) => {
    if (!possuiRuntimeTauri()) {
        throw {
            code: "TAURI_NAO_DISPONIVEL",
            message: provider
                ? `A integração ${provider} está disponível no aplicativo desktop.`
                : "Esta integração está disponível no aplicativo desktop.",
        }
    }
}
