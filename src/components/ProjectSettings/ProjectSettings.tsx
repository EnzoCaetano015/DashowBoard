import { Pencil } from "lucide-react"

import type { ProjectSettingsProps } from "@/components/ProjectSettings/ProjectSettings.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const ProjectSettings = ({ projeto, onEditar }: ProjectSettingsProps) => (
    <Card className="py-6">
        <CardContent className="px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold">Project settings</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review the saved settings for this local group.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditar}
                >
                    <Pencil />
                    Edit settings
                </Button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Item
                    titulo="Interval"
                    valor={`${projeto.intervaloVerificacaoSegundos} s`}
                    mono
                />
                <Item
                    titulo="Timeout"
                    valor={`${projeto.timeoutSegundos} s`}
                    mono
                />
                <Item
                    titulo="Notifications"
                    valor={`System · ${projeto.notificacoesAtivas ? "enabled" : "disabled"}`}
                />
                <Item
                    titulo="Deployment collection"
                    valor={projeto.coletarDeployments ? "Enabled for all providers" : "Disabled"}
                />
            </div>
        </CardContent>
    </Card>
)

const Item = ({ titulo, valor, mono = false }: { titulo: string; valor: string; mono?: boolean }) => (
    <div className="glass-subtle rounded-2xl p-4">
        <div className="text-xs uppercase text-muted-foreground">{titulo}</div>
        <div className={mono ? "mt-1 font-mono text-lg" : "mt-1 text-sm"}>{valor}</div>
    </div>
)
