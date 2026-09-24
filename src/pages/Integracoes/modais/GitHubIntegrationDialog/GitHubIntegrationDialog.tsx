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
                    titulo="Conexões GitHub"
                    subTitulo="Cadastre uma conexão para sua conta pessoal e outra para organizações como a Nexus."
                />
                <Modal.Body className="space-y-4">
                    {!runtimeDisponivel ? (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center">
                                <KeyRound className="mx-auto size-8 text-muted-foreground" />
                                <p className="mt-3 text-sm">
                                    A integração GitHub está disponível no aplicativo desktop.
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
                                    titulo="Nenhuma conexão GitHub"
                                    subtitulo="Adicione uma conexão para consultar seus repositórios."
                                    acao={
                                        <Button onClick={startNew}>
                                            <Plus /> Adicionar conexão
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
                                                        ? "Conectada"
                                                        : "Erro"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                @{connection.login} ·{" "}
                                                {connection.tipo === Enum.TipoConexaoGitHub.Organizacao
                                                    ? "Organização"
                                                    : "Pessoal"}{" "}
                                                · {connection.resourceOwner}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {connection.quantidadeRepositorios} repositórios ·{" "}
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
                                                <RefreshCw /> Testar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={() => startUpdate(connection)}
                                            >
                                                <KeyRound /> Substituir token
                                            </Button>
                                            <IconAction
                                                size="icon-sm"
                                                variant="destructive"
                                                label={`Remover conexão GitHub ${connection.nome}`}
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
                                    <Label htmlFor="github-connection-name">Nome da conexão</Label>
                                    <Input
                                        id="github-connection-name"
                                        value={nome}
                                        onChange={(event) => setNome(event.target.value)}
                                        placeholder="Conta pessoal"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
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
                                                Pessoal
                                            </SelectItem>
                                            <SelectItem value={Enum.TipoConexaoGitHub.Organizacao}>
                                                Organização
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
                                        placeholder="seu-login ou Nexus"
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
                                    Use um fine-grained PAT somente leitura, limitado aos repositórios
                                    necessários. O token fica no cofre nativo e nunca é exibido
                                    novamente.
                                </span>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={resetForm}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={isPending}
                                    onClick={() => void save()}
                                >
                                    {isPending ? <RefreshCw className="animate-spin" /> : <KeyRound />}
                                    {connectionId ? "Atualizar conexão" : "Salvar e validar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Actions>
                    {runtimeDisponivel && !formVisible && connections.length > 0 && (
                        <Button onClick={startNew}>
                            <Plus /> Adicionar conexão
                        </Button>
                    )}
                </Modal.Actions>
            </Modal.Content>
            <ConfirmarRemocao
                open={modal.removerConexao}
                onClose={cancelRemove}
                titulo={`Remover ${connectionToRemove?.nome ?? "conexão"}?`}
                descricao="O token desta conexão será removido do cofre. As outras conexões permanecem intactas."
                isPending={removeIsPending}
                onConfirm={() => void remove()}
            />
        </>
    )
}
