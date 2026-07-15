import { AlertCircle, CheckCircle2, Clock, KeyRound, RefreshCw } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import type { ObterIntegracoes } from "@/backend/api/models/integracao.types"
import { ProviderIcon } from "@/components/ProviderIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { labelProvider } from "@/lib/utils/status"

export const IntegrationCard = ({
    integracao,
    onTestar,
    onConfigurar,
}: {
    integracao: ObterIntegracoes.Integracao
    onTestar: () => void
    onConfigurar: () => void
}) => {
    const conectada = integracao.status === Enum.StatusIntegracao.Conectado
    const emBreve = integracao.status === Enum.StatusIntegracao.EmBreve

    return (
        <Card
            className={cn(
                "border-border py-5 shadow-none",
                integracao.status === Enum.StatusIntegracao.Erro && "border-destructive/40"
            )}
        >
            <CardContent className="px-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-2 ring-1 ring-border">
                            <ProviderIcon
                                provider={integracao.provider}
                                className="size-5"
                            />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-semibold">{labelProvider[integracao.provider]}</h2>
                            <p className="truncate text-xs text-muted-foreground">{integracao.conta}</p>
                        </div>
                    </div>
                    <span
                        className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
                            emBreve
                                ? "border-border bg-surface-2 text-muted-foreground"
                                : conectada
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                        )}
                    >
                        {emBreve ? (
                            <Clock className="size-3" />
                        ) : conectada ? (
                            <CheckCircle2 className="size-3" />
                        ) : (
                            <AlertCircle className="size-3" />
                        )}
                        {emBreve ? "Em breve" : conectada ? "Conectado" : "Desconectado"}
                    </span>
                </div>
                {integracao.erro && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        {integracao.erro}
                    </div>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Última sincronização:{" "}
                    <span className="text-foreground">{integracao.ultimaSincronizacao}</span>
                </div>
                {!emBreve && <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onTestar}
                    >
                        <RefreshCw />
                        Testar conexão
                    </Button>
                    <Button
                        size="sm"
                        onClick={onConfigurar}
                    >
                        <KeyRound />
                        {conectada ? "Atualizar token" : "Configurar token"}
                    </Button>
                </div>}
            </CardContent>
        </Card>
    )
}
