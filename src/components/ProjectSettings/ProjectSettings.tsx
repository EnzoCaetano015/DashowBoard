import { Pencil } from "lucide-react"

import type { ProjectSettingsProps } from "@/components/ProjectSettings/ProjectSettings.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const ProjectSettings = ({ projeto, onEditar }: ProjectSettingsProps) => (
    <Card className="border-border py-6 shadow-none">
        <CardContent className="px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold">Configurações do projeto</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Confira as configurações persistidas para este agrupamento local.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditar}
                >
                    <Pencil />
                    Editar configurações
                </Button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Item
                    titulo="Intervalo"
                    valor={`${projeto.intervaloVerificacaoSegundos} s`}
                    mono
                />
                <Item
                    titulo="Timeout"
                    valor={`${projeto.timeoutSegundos} s`}
                    mono
                />
                <Item
                    titulo="Notificações"
                    valor={`Sistema · ${projeto.notificacoesAtivas ? "ativado" : "desativado"}`}
                />
                <Item
                    titulo="Coleta de deployments"
                    valor={projeto.coletarDeployments ? "Ativada para todos os providers" : "Desativada"}
                />
            </div>
        </CardContent>
    </Card>
)

const Item = ({ titulo, valor, mono = false }: { titulo: string; valor: string; mono?: boolean }) => (
    <div className="rounded-md border border-border bg-surface-2 p-4">
        <div className="text-xs uppercase text-muted-foreground">{titulo}</div>
        <div className={mono ? "mt-1 font-mono text-lg" : "mt-1 text-sm"}>{valor}</div>
    </div>
)
