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
import { abrirUrlExterna } from "@/lib/utils/tauri"
import { ConfirmarRemocao } from "@/pages/Integracoes/modais/ConfirmarRemocao/ConfirmarRemocao"
import { useSupabaseIntegrationDialog } from "@/pages/Integracoes/modais/SupabaseIntegrationDialog/SupabaseIntegrationDialog.hook"
import type { SupabaseIntegrationDialogProps } from "@/pages/Integracoes/modais/SupabaseIntegrationDialog/SupabaseIntegrationDialog.types"
import { SUPABASE_TOKENS_URL } from "@/pages/Integracoes/modais/SupabaseIntegrationDialog/SupabaseIntegrationDialog.utils"

export const SupabaseIntegrationDialog = ({ open, onClose }: SupabaseIntegrationDialogProps) => {
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
        startRemove,
        cancelRemove,
        remove,
    } = useSupabaseIntegrationDialog()

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
                    titulo="Integração Supabase"
                    subTitulo="Consulte organizações e projetos pela Management API, somente para leitura."
                />
                <Modal.Body className="space-y-4">
                    {!runtimeDisponivel ? (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center">
                                <KeyRound className="mx-auto size-8 text-muted-foreground" />
                                <p className="mt-3 text-sm">
                                    A integração Supabase está disponível no aplicativo desktop.
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
                                        <span className="flex size-11 items-center justify-center rounded-lg bg-surface-2 ring-1 ring-border">
                                            <ProviderIcon provider={Enum.Provider.Supabase} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium">@{connection.username}</h3>
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
                                                        ? "Conectado"
                                                        : "Erro"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {connection.email} · {connection.quantidadeOrganizacoes}{" "}
                                                organização(ões) · {connection.quantidadeProjetos}{" "}
                                                projeto(s)
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
                                                disabled={isPending}
                                                onClick={() => void test()}
                                            >
                                                <RefreshCw /> Testar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={startUpdate}
                                            >
                                                <KeyRound /> Substituir token
                                            </Button>
                                            <IconAction
                                                size="icon-sm"
                                                variant="destructive"
                                                label={`Remover conexão Supabase @${connection.username}`}
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
                                        <Label htmlFor="supabase-token">Personal Access Token</Label>
                                        <Input
                                            id="supabase-token"
                                            type="password"
                                            autoComplete="off"
                                            value={token}
                                            onChange={(event) => setToken(event.target.value)}
                                            placeholder="sbp_••••••••••••••••"
                                        />
                                        <Button
                                            variant="link"
                                            className="h-auto p-0 text-xs"
                                            onClick={() => void abrirUrlExterna(SUPABASE_TOKENS_URL)}
                                        >
                                            Criar token em Account → Access Tokens <ExternalLink />
                                        </Button>
                                    </div>
                                    <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-muted-foreground">
                                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                        <span>
                                            O PAT é validado antes de ser salvo e permanece somente no
                                            cofre nativo do sistema operacional.
                                        </span>
                                    </div>
                                    <Modal.Actions>
                                        {connection && (
                                            <Button
                                                variant="ghost"
                                                onClick={resetForm}
                                            >
                                                Cancelar
                                            </Button>
                                        )}
                                        <Button
                                            disabled={isPending}
                                            onClick={() => void save()}
                                        >
                                            <ShieldCheck /> Salvar e validar
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
                titulo="Remover conexão Supabase?"
                descricao="O PAT será removido do cofre nativo do sistema."
                isPending={removeIsPending}
                onConfirm={() => void remove()}
            />
        </>
    )
}
