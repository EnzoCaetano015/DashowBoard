import {
    AlertCircle,
    CheckCircle2,
    KeyRound,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
} from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { useGitHubIntegrationDialog } from "@/components/GitHubIntegrationDialog/GitHubIntegrationDialog.hook"
import type { GitHubIntegrationDialogProps } from "@/components/GitHubIntegrationDialog/GitHubIntegrationDialog.types"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { normalizarErroGitHub } from "@/lib/utils/github"

export const GitHubIntegrationDialog = ({ open, onOpenChange }: GitHubIntegrationDialogProps) => {
    const dialog = useGitHubIntegrationDialog()

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) dialog.resetForm()
                onOpenChange(value)
            }}
        >
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Conexões GitHub</DialogTitle>
                    <DialogDescription>
                        Cadastre uma conexão para sua conta pessoal e outra para organizações como
                        a Nexus.
                    </DialogDescription>
                </DialogHeader>

                {!dialog.runtimeDisponivel ? (
                    <Card className="border-dashed">
                        <CardContent className="py-10 text-center">
                            <KeyRound className="mx-auto size-8 text-muted-foreground" />
                            <p className="mt-3 text-sm">
                                A integração GitHub está disponível no aplicativo desktop.
                            </p>
                        </CardContent>
                    </Card>
                ) : dialog.isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }, (_, index) => (
                            <Skeleton key={index} className="h-28" />
                        ))}
                    </div>
                ) : dialog.isError ? (
                    <Card className="border-destructive/40">
                        <CardContent className="py-8 text-center">
                            <AlertCircle className="mx-auto size-7 text-destructive" />
                            <p className="mt-2 text-sm">{normalizarErroGitHub(dialog.error).message}</p>
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
                    <div className="space-y-3">
                        {dialog.connections.length === 0 && !dialog.formVisible && (
                            <Card className="border-dashed">
                                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhuma conexão GitHub configurada.
                                </CardContent>
                            </Card>
                        )}
                        {dialog.connections.map((connection) => (
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
                                            {connection.tipo ===
                                            Enum.TipoConexaoGitHub.Organizacao
                                                ? "Organização"
                                                : "Pessoal"}{" "}
                                            · {connection.resourceOwner}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {connection.quantidadeRepositorios} repositórios ·{" "}
                                            {new Date(
                                                connection.ultimaSincronizacao
                                            ).toLocaleString("pt-BR")}
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
                                            onClick={() => void dialog.test(connection.id)}
                                        >
                                            <RefreshCw /> Testar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={dialog.isPending}
                                            onClick={() => dialog.startUpdate(connection)}
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
                                                        Remover {connection.nome}?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        O token desta conexão será removido do cofre.
                                                        As outras conexões permanecem intactas.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            void dialog.remove(connection.id)
                                                        }
                                                    >
                                                        Remover
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {dialog.runtimeDisponivel && dialog.formVisible && (
                    <div className="space-y-4 rounded-lg border border-border bg-surface-2 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="github-connection-name">Nome da conexão</Label>
                                <Input
                                    id="github-connection-name"
                                    value={dialog.nome}
                                    onChange={(event) => dialog.setNome(event.target.value)}
                                    placeholder="Conta pessoal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={dialog.tipo}
                                    onValueChange={(value) =>
                                        value &&
                                        dialog.setTipo(value as Enum.TipoConexaoGitHub)
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
                                    value={dialog.resourceOwner}
                                    onChange={(event) =>
                                        dialog.setResourceOwner(event.target.value)
                                    }
                                    placeholder="seu-login ou Nexus"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="github-token">Fine-grained token</Label>
                                <Input
                                    id="github-token"
                                    type="password"
                                    autoComplete="off"
                                    value={dialog.token}
                                    onChange={(event) => dialog.setToken(event.target.value)}
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
                                disabled={dialog.isPending}
                                onClick={dialog.resetForm}
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={dialog.isPending}
                                onClick={() => void dialog.save()}
                            >
                                {dialog.isPending ? (
                                    <RefreshCw className="animate-spin" />
                                ) : (
                                    <KeyRound />
                                )}
                                {dialog.connectionId ? "Atualizar conexão" : "Salvar e validar"}
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {dialog.runtimeDisponivel && !dialog.formVisible && (
                        <Button onClick={dialog.startNew}>
                            <Plus /> Adicionar conexão
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
