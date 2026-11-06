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
import { IconAction } from "@/components/IconAction/IconAction"
import { Modal } from "@/components/Modal"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { ConfirmarRemocao } from "@/pages/Integracoes/modais/ConfirmarRemocao/ConfirmarRemocao"
import { useRailwayIntegrationDialog } from "@/pages/Integracoes/modais/RailwayIntegrationDialog/RailwayIntegrationDialog.hook"
import type { RailwayIntegrationDialogProps } from "@/pages/Integracoes/modais/RailwayIntegrationDialog/RailwayIntegrationDialog.types"

export const RailwayIntegrationDialog = ({ open, onClose }: RailwayIntegrationDialogProps) => {
    const {
        modal,
        runtimeDisponivel,
        connection,
        isLoading,
        isPending,
        removeIsPending,
        token,
        showForm,
        setToken,
        startUpdate,
        resetForm,
        save,
        test,
        openTokens,
        startRemove,
        cancelRemove,
        remove,
    } = useRailwayIntegrationDialog()

    return (
        <>
            <Modal.Content
                open={open}
                onClose={() => {
                    resetForm()
                    onClose()
                }}
                className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
            >
                <Modal.Header
                    titulo="Railway integration"
                    subTitulo="Browse personal projects and all workspaces accessible to your account."
                />
                <Modal.Body className="space-y-4">
                    {!runtimeDisponivel ? (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center">
                                <KeyRound className="mx-auto size-8 text-muted-foreground" />
                                <p className="mt-3 text-sm">
                                    The Railway integration is available in the desktop app.
                                </p>
                            </CardContent>
                        </Card>
                    ) : isLoading ? (
                        <TemplateEstado.Carregando
                            skeleton={{ quantidade: 1, orientacao: "vertical" }}
                            className="**:data-[slot=skeleton]:h-48"
                        />
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
                                                <ProviderIcon provider={Enum.Provider.Railway} />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium">{connection.nome}</h3>
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
                                                    {connection.status ===
                                                    Enum.StatusIntegracao.Conectado
                                                        ? "Connected"
                                                        : "Error"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {connection.email} · {connection.quantidadeWorkspaces}{" "}
                                                workspace(s) · {connection.quantidadeProjetos} project(s)
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Last sync:{" "}
                                                {formatarDataHora(connection.ultimaSincronizacao)}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Current usage is not exposed through a stable public query.
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Remaining balance is not exposed by the public API.
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
                                                disabled={isPending}
                                                onClick={() => void test()}
                                            >
                                                <RefreshCw /> Test
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={startUpdate}
                                            >
                                                <KeyRound /> Replace token
                                            </Button>
                                            <IconAction
                                                size="icon-sm"
                                                variant="destructive"
                                                label={`Remove Railway connection ${connection.nome}`}
                                                disabled={isPending}
                                                onClick={startRemove}
                                            >
                                                <Trash2 />
                                            </IconAction>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {showForm && (
                                <div className="space-y-4 rounded-lg border border-border bg-surface-2 p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="railway-token">Railway Account Token</Label>
                                            <Button
                                                size="xs"
                                                variant="link"
                                                onClick={() => void openTokens()}
                                            >
                                                Generate token <ExternalLink />
                                            </Button>
                                        </div>
                                        <Input
                                            id="railway-token"
                                            type="password"
                                            autoComplete="off"
                                            value={token}
                                            onChange={(event) => setToken(event.target.value)}
                                            placeholder="••••••••••••••••"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            In Account Settings → Tokens, select “No workspace” to create an account token rather than a Project Token.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                        <span>
                                            The token is validated before being saved in the native vault. The integration is read-only and never returns the token to the interface.
                                        </span>
                                    </div>
                                    <Modal.Actions>
                                        {connection && (
                                            <Button
                                                variant="ghost"
                                                onClick={resetForm}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            disabled={isPending}
                                            onClick={() => void save()}
                                        >
                                            <ShieldCheck /> Save and validate
                                        </Button>
                                    </Modal.Actions>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal.Content>
            <ConfirmarRemocao
                open={modal.removerConexao}
                onClose={cancelRemove}
                titulo="Remove Railway connection?"
                descricao="The token will be removed from the native vault. Local projects will not be deleted."
                isPending={removeIsPending}
                onConfirm={() => void remove()}
            />
        </>
    )
}
