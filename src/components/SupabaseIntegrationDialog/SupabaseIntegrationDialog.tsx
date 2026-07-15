import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    KeyRound,
    RefreshCw,
    ShieldCheck,
    Trash2,
} from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { ProviderIcon } from "@/components/ProviderIcon"
import { useSupabaseIntegrationDialog } from "@/components/SupabaseIntegrationDialog/SupabaseIntegrationDialog.hook"
import type { SupabaseIntegrationDialogProps } from "@/components/SupabaseIntegrationDialog/SupabaseIntegrationDialog.types"
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
import { normalizarErroSupabase } from "@/lib/utils/supabase"
import { abrirUrlExterna } from "@/lib/utils/tauri"

const TOKENS_URL = "https://supabase.com/dashboard/account/tokens"

export const SupabaseIntegrationDialog = ({ open, onOpenChange }: SupabaseIntegrationDialogProps) => {
    const dialog = useSupabaseIntegrationDialog()
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
                    <DialogTitle>Integração Supabase</DialogTitle>
                    <DialogDescription>
                        Consulte organizações e projetos pela Management API, somente para leitura.
                    </DialogDescription>
                </DialogHeader>

                {!dialog.runtimeDisponivel ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center">
                            <KeyRound className="mx-auto size-8 text-muted-foreground" />
                            <p className="mt-3 text-sm">
                                A integração Supabase está disponível no aplicativo desktop.
                            </p>
                        </CardContent>
                    </Card>
                ) : dialog.isLoading ? (
                    <Skeleton className="h-48" />
                ) : dialog.isError && !dialog.formVisible ? (
                    <Card className="border-destructive/40">
                        <CardContent className="py-8 text-center">
                            <AlertCircle className="mx-auto size-7 text-destructive" />
                            <p className="mt-2 text-sm">
                                {normalizarErroSupabase(dialog.error).message}
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => void dialog.retry()}
                                >
                                    Tentar novamente
                                </Button>
                                <Button onClick={dialog.startUpdate}>Substituir token</Button>
                            </div>
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
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-surface-2 ring-1 ring-border">
                                        <ProviderIcon provider={Enum.Provider.Supabase} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-medium">@{connection.username}</h3>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                                                    connection.status === Enum.StatusIntegracao.Conectado
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
                                            {connection.email} · {connection.quantidadeOrganizacoes}{" "}
                                            organização(ões) · {connection.quantidadeProjetos} projeto(s)
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Última sincronização:{" "}
                                            {formatarDataHora(connection.ultimaSincronizacao)}
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
                                                    <AlertDialogTitle>
                                                        Remover conexão Supabase?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        O PAT será removido do cofre nativo do sistema.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => void dialog.remove()}
                                                    >
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
                                    <Label htmlFor="supabase-token">Personal Access Token</Label>
                                    <Input
                                        id="supabase-token"
                                        type="password"
                                        autoComplete="off"
                                        value={dialog.token}
                                        onChange={(event) => dialog.setToken(event.target.value)}
                                        placeholder="sbp_••••••••••••••••"
                                    />
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => void abrirUrlExterna(TOKENS_URL)}
                                    >
                                        Criar token em Account → Access Tokens <ExternalLink />
                                    </Button>
                                </div>
                                <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-muted-foreground">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                    <span>
                                        O PAT é validado antes de ser salvo e permanece somente no cofre
                                        nativo do sistema operacional.
                                    </span>
                                </div>
                                <DialogFooter>
                                    {connection && (
                                        <Button
                                            variant="ghost"
                                            onClick={dialog.resetForm}
                                        >
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
