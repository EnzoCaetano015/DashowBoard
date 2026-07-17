import type { MonitoramentoStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const MonitoramentoStep = ({
    intervaloVerificacao,
    timeout,
    notificacoes,
    coletarDeployments,
    alterarIntervalo,
    alterarTimeout,
    alterarNotificacoes,
    alterarColetaDeployments,
}: MonitoramentoStepProps) => (
    <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Como o DashowBoard deve verificar este projeto?</p>
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
                <Label>Intervalo de verificação</Label>
                <Select
                    value={String(intervaloVerificacao)}
                    onValueChange={(valor) => valor && alterarIntervalo(Number(valor))}
                >
                    <SelectTrigger className="w-full bg-surface-2">
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
                <Label>Timeout de resposta</Label>
                <Select
                    value={String(timeout)}
                    onValueChange={(valor) => valor && alterarTimeout(Number(valor))}
                >
                    <SelectTrigger className="w-full bg-surface-2">
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
                    checked={coletarDeployments}
                    onCheckedChange={(valor) => alterarColetaDeployments(valor === true)}
                />
                Registrar deployments disponíveis
            </label>
            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={notificacoes}
                    onCheckedChange={(valor) => alterarNotificacoes(valor === true)}
                />
                Notificar no sistema quando um serviço cair
            </label>
            <p className="text-xs text-muted-foreground">
                Mudanças reais de status serão registradas automaticamente no histórico local.
            </p>
        </div>
    </div>
)
