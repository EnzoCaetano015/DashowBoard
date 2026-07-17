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
    const { formulario, atualizarProjetoIsPending, alterarCampo, salvar } = useEditProjectDialog(
        projeto,
        onClose
    )

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
                    titulo="Editar projeto"
                    subTitulo="Atualize as informações e configurações do agrupamento local."
                />
                <Modal.Body className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-nome">Nome do projeto</Label>
                            <Input
                                id="editar-projeto-nome"
                                value={formulario.nome}
                                onChange={({ target }) => alterarCampo("nome", target.value)}
                                disabled={atualizarProjetoIsPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-descricao">Descrição curta</Label>
                            <Textarea
                                id="editar-projeto-descricao"
                                value={formulario.descricao}
                                onChange={({ target }) => alterarCampo("descricao", target.value)}
                                disabled={atualizarProjetoIsPending}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-url">URL da aplicação (opcional)</Label>
                            <Input
                                id="editar-projeto-url"
                                value={formulario.urlAplicacao}
                                onChange={({ target }) => alterarCampo("urlAplicacao", target.value)}
                                disabled={atualizarProjetoIsPending}
                                type="url"
                                placeholder="https://app.exemplo.com"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-intervalo">Intervalo de verificação</Label>
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
                                    <SelectItem value="30">30 segundos</SelectItem>
                                    <SelectItem value="60">1 minuto</SelectItem>
                                    <SelectItem value="300">5 minutos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editar-projeto-timeout">Timeout de resposta</Label>
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
                                    <SelectItem value="2">2 segundos</SelectItem>
                                    <SelectItem value="5">5 segundos</SelectItem>
                                    <SelectItem value="10">10 segundos</SelectItem>
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
                            Registrar deployments disponíveis
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={formulario.notificacoesAtivas}
                                onCheckedChange={(valor) =>
                                    alterarCampo("notificacoesAtivas", valor === true)
                                }
                                disabled={atualizarProjetoIsPending}
                            />
                            Notificar no sistema quando um serviço cair
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
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={atualizarProjetoIsPending}
                    >
                        {atualizarProjetoIsPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </Modal.Actions>
            </form>
        </Modal.Content>
    )
}
