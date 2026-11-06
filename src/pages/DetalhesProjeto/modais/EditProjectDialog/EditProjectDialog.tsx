import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEditProjectDialog } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.hook"
import type { EditProjectDialogProps } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog.types"

export const EditProjectDialog = ({ open, onClose, projeto }: EditProjectDialogProps) => {
    const { formulario, erros, atualizarProjetoIsPending, alterarCampo, validarCampo, salvar } =
        useEditProjectDialog(projeto, onClose)

    return (
        <Modal.Content
            open={open}
            onClose={onClose}
            disableClose={atualizarProjetoIsPending}
            className="max-h-[90dvh] overflow-y-auto border-border bg-card sm:max-w-2xl"
        >
            <form
                className="grid gap-4"
                onSubmit={(evento) => {
                    evento.preventDefault()
                    void salvar()
                }}
            >
                <Modal.Header
                    titulo="Edit project"
                    subTitulo="Update the information and settings for this local group."
                />
                <Modal.Body className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-nome">Project name</Label>
                            <Input
                                id="editar-projeto-nome"
                                value={formulario.nome}
                                onChange={({ target }) => alterarCampo("nome", target.value)}
                                onBlur={() => validarCampo("nome")}
                                disabled={atualizarProjetoIsPending}
                                aria-invalid={Boolean(erros.nome)}
                                aria-describedby={erros.nome ? "editar-projeto-nome-erro" : undefined}
                            />
                            {erros.nome && (
                                <p
                                    id="editar-projeto-nome-erro"
                                    className="text-xs text-destructive"
                                >
                                    {erros.nome}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-descricao">Short description</Label>
                            <Textarea
                                id="editar-projeto-descricao"
                                value={formulario.descricao}
                                onChange={({ target }) => alterarCampo("descricao", target.value)}
                                disabled={atualizarProjetoIsPending}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-url">Application URL (optional)</Label>
                            <Input
                                id="editar-projeto-url"
                                value={formulario.urlAplicacao}
                                onChange={({ target }) => alterarCampo("urlAplicacao", target.value)}
                                onBlur={() => validarCampo("urlAplicacao")}
                                disabled={atualizarProjetoIsPending}
                                type="url"
                                placeholder="https://app.example.com"
                                aria-invalid={Boolean(erros.urlAplicacao)}
                                aria-describedby={
                                    erros.urlAplicacao ? "editar-projeto-url-erro" : undefined
                                }
                            />
                            {erros.urlAplicacao && (
                                <p
                                    id="editar-projeto-url-erro"
                                    className="text-xs text-destructive"
                                >
                                    {erros.urlAplicacao}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-intervalo">Check interval</Label>
                            <Select
                                value={String(formulario.intervaloVerificacaoSegundos)}
                                onValueChange={(valor) =>
                                    valor && alterarCampo("intervaloVerificacaoSegundos", Number(valor))
                                }
                                disabled={atualizarProjetoIsPending}
                            >
                                <SelectTrigger
                                    id="editar-projeto-intervalo"
                                    className="w-full bg-surface-2"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 seconds</SelectItem>
                                    <SelectItem value="60">1 minute</SelectItem>
                                    <SelectItem value="300">5 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-timeout">Response timeout</Label>
                            <Select
                                value={String(formulario.timeoutSegundos)}
                                onValueChange={(valor) =>
                                    valor && alterarCampo("timeoutSegundos", Number(valor))
                                }
                                disabled={atualizarProjetoIsPending}
                            >
                                <SelectTrigger
                                    id="editar-projeto-timeout"
                                    className="w-full bg-surface-2"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 seconds</SelectItem>
                                    <SelectItem value="5">5 seconds</SelectItem>
                                    <SelectItem value="10">10 seconds</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-md border border-border bg-surface-2 p-3">
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={formulario.coletarDeployments}
                                onCheckedChange={(valor) =>
                                    alterarCampo("coletarDeployments", valor === true)
                                }
                                disabled={atualizarProjetoIsPending}
                            />
                            Record available deployments
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={formulario.notificacoesAtivas}
                                onCheckedChange={(valor) =>
                                    alterarCampo("notificacoesAtivas", valor === true)
                                }
                                disabled={atualizarProjetoIsPending}
                            />
                            Send a system notification when a service goes down
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Actions>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={atualizarProjetoIsPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={atualizarProjetoIsPending}
                    >
                        {atualizarProjetoIsPending ? "Saving..." : "Save changes"}
                    </Button>
                </Modal.Actions>
            </form>
        </Modal.Content>
    )
}
