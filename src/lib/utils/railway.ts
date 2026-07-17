import type { ErroRailway } from "@/backend/api/models/railway.types"

export const normalizarErroRailway = (error: unknown): ErroRailway => {
    if (typeof error === "object" && error !== null) {
        const code = "code" in error && typeof error.code === "string" ? error.code : undefined
        const message =
            "message" in error && typeof error.message === "string" ? error.message : undefined
        const resetAt =
            "resetAt" in error && typeof error.resetAt === "string" ? error.resetAt : undefined
        const rateLimit =
            "rateLimit" in error && typeof error.rateLimit === "number" ? error.rateLimit : undefined
        const rateLimitRemaining =
            "rateLimitRemaining" in error && typeof error.rateLimitRemaining === "number"
                ? error.rateLimitRemaining
                : undefined
        if (code && message) {
            return { code, message, resetAt, rateLimit, rateLimitRemaining }
        }
    }
    return {
        code: "RAILWAY_ERRO_DESCONHECIDO",
        message: "Não foi possível concluir a operação com a Railway.",
    }
}

export const deveTentarNovamenteRailway = (failureCount: number, error: unknown) => {
    const { code } = normalizarErroRailway(error)
    return (
        failureCount < 1 &&
        ![
            "RAILWAY_TOKEN_INVALIDO",
            "RAILWAY_TOKEN_EXPIRADO",
            "RAILWAY_SEM_PERMISSAO",
            "RAILWAY_RATE_LIMIT",
            "RAILWAY_GRAPHQL",
        ].includes(code)
    )
}
