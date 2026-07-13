import { Enum } from "@/backend/api/enums/enum"

export const estilosStatus: Record<
    Enum.StatusProjeto,
    { ponto: string; texto: string; fundo: string; borda: string }
> = {
    [Enum.StatusProjeto.Saudavel]: {
        ponto: "bg-success text-success",
        texto: "text-success",
        fundo: "bg-success/10",
        borda: "border-success/30",
    },
    [Enum.StatusProjeto.Degradado]: {
        ponto: "bg-warning text-warning",
        texto: "text-warning",
        fundo: "bg-warning/10",
        borda: "border-warning/30",
    },
    [Enum.StatusProjeto.Offline]: {
        ponto: "bg-destructive text-destructive",
        texto: "text-destructive",
        fundo: "bg-destructive/10",
        borda: "border-destructive/30",
    },
    [Enum.StatusProjeto.Atualizando]: {
        ponto: "bg-info text-info",
        texto: "text-info",
        fundo: "bg-info/10",
        borda: "border-info/30",
    },
    [Enum.StatusProjeto.Desconhecido]: {
        ponto: "bg-muted-foreground text-muted-foreground",
        texto: "text-muted-foreground",
        fundo: "bg-muted/40",
        borda: "border-border",
    },
}
