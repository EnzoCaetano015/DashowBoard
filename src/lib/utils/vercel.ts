import type { ErroVercel } from "@/backend/api/models/vercel.types"

export const normalizarErroVercel = (error: unknown): ErroVercel => {
    if (typeof error === "object" && error !== null) {
        const code = "code" in error && typeof error.code === "string" ? error.code : undefined
        const message =
            "message" in error && typeof error.message === "string" ? error.message : undefined
        const resetAt =
            "resetAt" in error && typeof error.resetAt === "string" ? error.resetAt : undefined
        if (code && message) return { code, message, resetAt }
    }
    return {
        code: "VERCEL_ERRO_DESCONHECIDO",
        message: "Não foi possível concluir a operação com a Vercel.",
    }
}

export const deveTentarNovamenteVercel = (failureCount: number, error: unknown) => {
    const { code } = normalizarErroVercel(error)
    return (
        failureCount < 1 &&
        ![
            "VERCEL_TOKEN_INVALIDO",
            "VERCEL_TOKEN_EXPIRADO",
            "VERCEL_SEM_PERMISSAO",
            "VERCEL_RATE_LIMIT",
        ].includes(code)
    )
}
