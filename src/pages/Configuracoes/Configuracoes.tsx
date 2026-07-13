import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConfiguracoes } from "@/pages/Configuracoes/Configuracoes.hook"
import type { CampoProps, ItemProps, SecaoProps } from "@/pages/Configuracoes/Configuracoes.types"

export const ConfiguracoesPage = () => {
    const pagina = useConfiguracoes()
    const p = pagina.preferencias

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Preferências globais do DashwoBoard neste computador.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Secao
                    titulo="Aplicativo"
                    descricao="Comportamento geral do desktop."
                >
                    <Campo
                        titulo="Iniciar com o sistema"
                        controleId="iniciar-sistema"
                    >
                        <Checkbox
                            id="iniciar-sistema"
                            checked={p.iniciarComSistema}
                            onCheckedChange={(valor) =>
                                pagina.alterar("iniciarComSistema", Boolean(valor))
                            }
                        />
                    </Campo>
                    <Campo
                        titulo="Verificação em segundo plano"
                        controleId="segundo-plano"
                    >
                        <Checkbox
                            id="segundo-plano"
                            checked={p.segundoPlano}
                            onCheckedChange={(valor) => pagina.alterar("segundoPlano", Boolean(valor))}
                        />
                    </Campo>
                    <Campo
                        titulo="Intervalo padrão"
                        controleId="intervalo-padrao"
                    >
                        <Select
                            value={p.intervalo}
                            onValueChange={(valor) => pagina.alterar("intervalo", valor ?? p.intervalo)}
                        >
                            <SelectTrigger id="intervalo-padrao">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 s</SelectItem>
                                <SelectItem value="60">1 min</SelectItem>
                                <SelectItem value="300">5 min</SelectItem>
                            </SelectContent>
                        </Select>
                    </Campo>
                </Secao>
                <Secao
                    titulo="Armazenamento"
                    descricao="Banco local em SQLite."
                >
                    <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">Caminho</div>
                        <div className="rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs">
                            ~/.dashowboard/data.sqlite
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagina.simular("Abrir pasta")}
                        >
                            Abrir pasta
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagina.simular("Exportar backup")}
                        >
                            Exportar backup
                        </Button>
                    </div>
                </Secao>
                <Secao
                    titulo="Notificações"
                    descricao="Como o app avisa você."
                >
                    <Campo
                        titulo="Notificações do sistema"
                        controleId="notificacoes-sistema"
                    >
                        <Checkbox
                            id="notificacoes-sistema"
                            checked={p.notificacoes}
                            onCheckedChange={(valor) => pagina.alterar("notificacoes", Boolean(valor))}
                        />
                    </Campo>
                    <Campo
                        titulo="Som ao detectar incidente"
                        controleId="som-incidente"
                    >
                        <Checkbox
                            id="som-incidente"
                            checked={p.som}
                            onCheckedChange={(valor) => pagina.alterar("som", Boolean(valor))}
                        />
                    </Campo>
                    <Campo
                        titulo="Badge de contagem no ícone"
                        controleId="badge-icone"
                    >
                        <Checkbox
                            id="badge-icone"
                            checked={p.badge}
                            onCheckedChange={(valor) => pagina.alterar("badge", Boolean(valor))}
                        />
                    </Campo>
                </Secao>
                <Secao
                    titulo="Aparência"
                    descricao="Tema e densidade."
                >
                    <Campo
                        titulo="Tema"
                        controleId="tema"
                    >
                        <Select
                            value={p.tema}
                            onValueChange={(valor) => pagina.alterar("tema", valor ?? p.tema)}
                        >
                            <SelectTrigger id="tema">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dark">Escuro (padrão)</SelectItem>
                                <SelectItem value="light">Claro</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                        </Select>
                    </Campo>
                    <Campo
                        titulo="Densidade"
                        controleId="densidade"
                    >
                        <Select
                            value={p.densidade}
                            onValueChange={(valor) => pagina.alterar("densidade", valor ?? p.densidade)}
                        >
                            <SelectTrigger id="densidade">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="comfortable">Confortável</SelectItem>
                                <SelectItem value="compact">Compacto</SelectItem>
                            </SelectContent>
                        </Select>
                    </Campo>
                </Secao>
                <Secao
                    titulo="Conta local"
                    descricao="Identificação usada no SQLite."
                >
                    <div className="space-y-2">
                        <Label htmlFor="nome-desenvolvedor">Nome do desenvolvedor</Label>
                        <Input
                            id="nome-desenvolvedor"
                            value={p.nome}
                            onChange={(evento) => pagina.alterar("nome", evento.target.value)}
                        />
                    </div>
                </Secao>
                <Secao
                    titulo="Sobre"
                    descricao="Versão e diagnóstico."
                >
                    <dl className="space-y-1 text-sm">
                        <Item
                            titulo="Versão"
                            valor="0.1.0"
                        />
                        <Item
                            titulo="Runtime"
                            valor="Tauri 2.x"
                        />
                        <Item
                            titulo="Build"
                            valor="dev-desktop"
                        />
                    </dl>
                </Secao>
            </div>
        </div>
    )
}

const Secao = ({
    titulo,
    descricao,
    children,
}: SecaoProps) => (
    <Card className="border-border py-5 shadow-none">
        <CardHeader className="px-5">
            <CardTitle>
                <h2 className="text-sm">{titulo}</h2>
            </CardTitle>
            <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5">{children}</CardContent>
    </Card>
)
const Campo = ({
    titulo,
    controleId,
    children,
}: CampoProps) => (
    <div className="flex items-center justify-between gap-3 text-sm">
        <Label
            htmlFor={controleId}
            className="font-normal text-muted-foreground"
        >
            {titulo}
        </Label>
        {children}
    </div>
)
const Item = ({ titulo, valor }: ItemProps) => (
    <div className="flex justify-between">
        <dt className="text-muted-foreground">{titulo}</dt>
        <dd className="font-mono">{valor}</dd>
    </div>
)
