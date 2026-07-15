export const possuiRuntimeTauri = () => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

export const exigirRuntimeTauri = () => {
    if (!possuiRuntimeTauri()) {
        throw {
            code: "TAURI_NAO_DISPONIVEL",
            message: "A integração GitHub está disponível no aplicativo desktop.",
        }
    }
}
