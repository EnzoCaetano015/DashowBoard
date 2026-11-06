import { AlertCircle, CheckCircle2, KeyRound, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { IconAction } from "@/components/IconAction/IconAction"
import { Modal } from "@/components/Modal"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatarDataHora } from "@/lib/utils/date"
import { ConfirmarRemocao } from "@/pages/Integracoes/modais/ConfirmarRemocao/ConfirmarRemocao"
import { useGitHubIntegrationDialog } from "@/pages/Integracoes/modais/GitHubIntegrationDialog/GitHubIntegrationDialog.hook"
import type { GitHubIntegrationDialogProps } from "@/pages/Integracoes/modais/GitHubIntegrationDialog/GitHubIntegrationDialog.types"

export const GitHubIntegrationDialog = ({ open, onClose }: GitHubIntegrationDialogProps) => {
    const {
        modal,
        runtimeDisponivel,
        connections,
        isLoading,
        isPending,
        removeIsPending,
        connectionToRemove,
        formVisible,
        connectionId,
        nome,
        tipo,
        resourceOwner,
        token,
        setNome,
        setTipo,
        setResourceOwner,
        setToken,
        startNew,
        startUpdate,
        resetForm,
        save,
        test,
        startRemove,
        cancelRemove,
        remove,
    } = useGitHubIntegrationDialog()

    return (
        <>
            <Modal.Content
                open={open}
                onClose={() => {
                    resetForm()
                    onClose()
                }}
                className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
            >
                <Modal.Header
                    titulo="GitHub connections"
                    subTitulo="Add a connection for your personal account and another for your organizations."
                />
                <Modal.Body className="space-y-4">
                    {!runtimeDisponivel ? (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center">
                                <KeyRound className="mx-auto size-8 text-muted-foreground" />
                                <p className="mt-3 text-sm">
                                    The GitHub integration is available in the desktop app.
                                </p>
                            </CardContent>
                        </Card>
                    ) : isLoading ? (
                        <TemplateEstado.Carregando
                            skeleton={{ quantidade: 2, orientacao: "vertical" }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {connections.length === 0 && !formVisible && (
                                <TemplateEstado.Vazio
                                    Icon={KeyRound}
                                    titulo="No GitHub connections"
                                    subtitulo="Add a connection to access your repositories."
                                    acao={
                                        <Button onClick={startNew}>
                                            <Plus /> Add connection
                                        </Button>
                                    }
                                />
                            )}
                            {connections.map((connection) => (
                                <Card
                                    key={connection.id}
                                    className={cn(
                                        "py-4 shadow-none",
                                        connection.status === Enum.StatusIntegracao.Erro &&
                                            "border-destructive/40"
                                    )}
                                >
                                    <CardContent className="flex flex-wrap items-start gap-3 px-4">
                                        <img
                                            src={connection.avatarUrl}
                                            alt=""
                                            className="size-10 rounded-lg ring-1 ring-border"
                                        />
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
                                                @{connection.login} ·{" "}
                                                {connection.tipo === Enum.TipoConexaoGitHub.Organizacao
                                                    ? "Organization"
                                                    : "Personal"}{" "}
                                                · {connection.resourceOwner}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {connection.quantidadeRepositorios} repositories ·{" "}
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
                                                onClick={() => void test(connection.id)}
                                            >
                                                <RefreshCw /> Test
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={() => startUpdate(connection)}
                                            >
                                                <KeyRound /> Replace token
                                            </Button>
                                            <IconAction
                                                size="icon-sm"
                                                variant="destructive"
                                                label={`Remove GitHub connection ${connection.nome}`}
                                                disabled={isPending}
                                                onClick={() => startRemove(connection)}
                                            >
                                                <Trash2 />
                                            </IconAction>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {runtimeDisponivel && formVisible && (
                        <div className="space-y-4 rounded-lg border border-border bg-surface-2 p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="github-connection-name">Connection name</Label>
                                    <Input
                                        id="github-connection-name"
                                        value={nome}
                                        onChange={(event) => setNome(event.target.value)}
                                        placeholder="Personal account"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={tipo}
                                        onValueChange={(value) =>
                                            value && setTipo(value as Enum.TipoConexaoGitHub)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Enum.TipoConexaoGitHub.Pessoal}>
                                                Personal
                                            </SelectItem>
                                            <SelectItem value={Enum.TipoConexaoGitHub.Organizacao}>
                                                Organization
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github-resource-owner">Resource owner</Label>
                                    <Input
                                        id="github-resource-owner"
                                        value={resourceOwner}
                                        onChange={(event) => setResourceOwner(event.target.value)}
                                        placeholder="your-username or organization"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github-token">Fine-grained token</Label>
                                    <Input
                                        id="github-token"
                                        type="password"
                                        autoComplete="off"
                                        value={token}
                                        onChange={(event) => setToken(event.target.value)}
                                        placeholder="github_pat_••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-muted-foreground">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                <span>
                                    Use a read-only fine-grained PAT limited to the required repositories. The token stays in the native credential vault and is never displayed again.
                                </span>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isPending}
                                    onClick={() => void save()}
                                >
                                    {isPending ? <RefreshCw className="animate-spin" /> : <KeyRound />}
                                    {connectionId ? "Update connection" : "Save and validate"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Actions>
                    {runtimeDisponivel && !formVisible && connections.length > 0 && (
                        <Button onClick={startNew}>
                            <Plus /> Add connection
                        </Button>
                    )}
                </Modal.Actions>
            </Modal.Content>
            <ConfirmarRemocao
                open={modal.removerConexao}
                onClose={cancelRemove}
                titulo={`Remove ${connectionToRemove?.nome ?? "connection"}?`}
                descricao="This connection's token will be removed from the vault. Other connections are unaffected."
                isPending={removeIsPending}
                onConfirm={() => void remove()}
            />
        </>
    )
}
