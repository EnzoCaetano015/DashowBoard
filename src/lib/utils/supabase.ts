import type { ErroSupabase } from "@/backend/api/models/supabase.types"

export const normalizarErroSupabase = (error: unknown): ErroSupabase => {
    if (typeof error === "object" && error !== null) {
        const code = "code" in error && typeof error.code === "string" ? error.code : undefined
        const message =
            "message" in error && typeof error.message === "string" ? error.message : undefined
        const resetAt =
            "resetAt" in error && typeof error.resetAt === "string" ? error.resetAt : undefined
        if (code && message) return { code, message, resetAt }
    }
    return {
        code: "SUPABASE_ERRO_DESCONHECIDO",
        message: "Não foi possível concluir a operação com o Supabase.",
    }
}

export const deveTentarNovamenteSupabase = (failureCount: number, error: unknown) => {
    const { code } = normalizarErroSupabase(error)
    return (
        failureCount < 1 &&
        ![
            "SUPABASE_TOKEN_INVALIDO",
            "SUPABASE_TOKEN_EXPIRADO",
            "SUPABASE_SEM_PERMISSAO",
            "SUPABASE_RATE_LIMIT",
        ].includes(code)
    )
}
