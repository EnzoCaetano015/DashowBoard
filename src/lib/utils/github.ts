import type { ErroGitHub } from "@/backend/api/models/github.types"

export const normalizarErroGitHub = (error: unknown): ErroGitHub => {
    if (typeof error === "object" && error !== null) {
        const code = "code" in error && typeof error.code === "string" ? error.code : undefined
        const message =
            "message" in error && typeof error.message === "string" ? error.message : undefined
        const resetAt =
            "resetAt" in error && typeof error.resetAt === "string" ? error.resetAt : undefined
        if (code && message) return { code, message, resetAt }
    }
    return {
        code: "GITHUB_ERRO_DESCONHECIDO",
        message: "Não foi possível concluir a operação com o GitHub.",
    }
}
