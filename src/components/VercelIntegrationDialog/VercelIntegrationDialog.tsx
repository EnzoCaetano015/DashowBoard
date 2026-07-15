import { AlertCircle, CheckCircle2, KeyRound, RefreshCw, ShieldCheck, Trash2 } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { ProviderIcon } from "@/components/ProviderIcon"
import { useVercelIntegrationDialog } from "@/components/VercelIntegrationDialog/VercelIntegrationDialog.hook"
import type { VercelIntegrationDialogProps } from "@/components/VercelIntegrationDialog/VercelIntegrationDialog.types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { normalizarErroVercel } from "@/lib/utils/vercel"

export const VercelIntegrationDialog = ({ open, onOpenChange }: VercelIntegrationDialogProps) => {
    const dialog = useVercelIntegrationDialog()
    const connection = dialog.connection

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) dialog.resetForm()
                onOpenChange(value)
            }}
        >
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Integração Vercel</DialogTitle>
                    <DialogDescription>
                        Consulte projetos pessoais e dos times acessíveis ao seu token.
                    </DialogDescription>
                </DialogHeader>

                {!dialog.runtimeDisponivel ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center">
                            <KeyRound className="mx-auto size-8 text-muted-foreground" />
                            <p className="mt-3 text-sm">
                                A integração Vercel está disponível no aplicativo desktop.
                            </p>
                        </CardContent>
                    </Card>
                ) : dialog.isLoading ? (
                    <Skeleton className="h-48" />
                ) : dialog.isError ? (
                    <Card className="border-destructive/40">
                        <CardContent className="py-8 text-center">
                            <AlertCircle className="mx-auto size-7 text-destructive" />
                            <p className="mt-2 text-sm">
                                {normalizarErroVercel(dialog.error).message}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => void dialog.retry()}
                            >
                                Tentar novamente
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {connection && (
                            <Card
                                className={cn(
                                    "py-4 shadow-none",
                                    connection.status === Enum.StatusIntegracao.Erro &&
                                        "border-destructive/40"
                                )}
                            >
                                <CardContent className="flex flex-wrap items-start gap-3 px-4">
                                    {connection.avatarUrl ? (
                                        <img
                                            src={connection.avatarUrl}
                                            alt=""
                                            className="size-11 rounded-lg ring-1 ring-border"
                                        />
                                    ) : (
                                        <span className="flex size-11 items-center justify-center rounded-lg bg-surface-2 ring-1 ring-border">
                                            <ProviderIcon provider={Enum.Provider.Vercel} />
                                        </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium">
                                                {connection.nome || `@${connection.username}`}
                                            </h3>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                                                    connection.status ===
                                                        Enum.StatusIntegracao.Conectado
                                                        ? "border-success/40 bg-success/10 text-success"
                                                        : "border-destructive/40 bg-destructive/10 text-destructive"
                                                )}
                                            >
                                                {connection.status ===
                                                Enum.StatusIntegracao.Conectado ? (
                                                    <CheckCircle2 className="size-3" />
                                                ) : (
                                                    <AlertCircle className="size-3" />
                                                )}
                                                {connection.status === Enum.StatusIntegracao.Conectado
                                                    ? "Conectado"
                                                    : "Erro"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            @{connection.username} · {connection.quantidadeTimes} time(s) ·{" "}
                                            {connection.quantidadeProjetos} projeto(s)
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Última sincronização: {formatarDataHora(connection.ultimaSincronizacao)}
                                        </p>
                                        {connection.erro && (
                                            <p className="mt-2 text-xs text-destructive">
                                                {connection.erro}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={dialog.isPending}
                                            onClick={() => void dialog.test()}
                                        >
                                            <RefreshCw /> Testar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={dialog.isPending}
                                            onClick={dialog.startUpdate}
                                        >
                                            <KeyRound /> Substituir token
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button
                                                        size="icon-sm"
                                                        variant="destructive"
                                                        title="Remover conexão"
                                                    />
                                                }
                                            >
                                                <Trash2 />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remover conexão Vercel?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        O token será removido do cofre nativo do sistema.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => void dialog.remove()}>
                                                        Remover
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {dialog.showForm && (
                            <div className="space-y-4 rounded-lg border border-border bg-surface-2 p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vercel-token">Token Vercel</Label>
                                    <Input
                                        id="vercel-token"
                                        type="password"
                                        autoComplete="off"
                                        value={dialog.token}
                                        onChange={(event) => dialog.setToken(event.target.value)}
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                                <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-muted-foreground">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                    <span>
                                        O token é validado antes de ser salvo e fica somente no cofre
                                        nativo do sistema operacional.
                                    </span>
                                </div>
                                <DialogFooter>
                                    {connection && (
                                        <Button variant="ghost" onClick={dialog.resetForm}>
                                            Cancelar
                                        </Button>
                                    )}
                                    <Button
                                        disabled={dialog.isPending}
                                        onClick={() => void dialog.save()}
                                    >
                                        <ShieldCheck /> Salvar e validar
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
