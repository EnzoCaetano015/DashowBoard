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
        <p className="text-sm text-muted-foreground">How should DashowBoard monitor this project?</p>
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
                <Label>Check interval</Label>
                <Select
                    value={String(intervaloVerificacao)}
                    onValueChange={(valor) => valor && alterarIntervalo(Number(valor))}
                >
                    <SelectTrigger className="w-full bg-surface-2">
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
                <Label>Response timeout</Label>
                <Select
                    value={String(timeout)}
                    onValueChange={(valor) => valor && alterarTimeout(Number(valor))}
                >
                    <SelectTrigger className="w-full bg-surface-2">
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
                    checked={coletarDeployments}
                    onCheckedChange={(valor) => alterarColetaDeployments(valor === true)}
                />
                Record available deployments
            </label>
            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={notificacoes}
                    onCheckedChange={(valor) => alterarNotificacoes(valor === true)}
                />
                Send a system notification when a service goes down
            </label>
            <p className="text-xs text-muted-foreground">
                Actual status changes are recorded automatically in local history.
            </p>
        </div>
    </div>
)
