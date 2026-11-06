import { Settings } from "lucide-react"

import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Campo } from "@/pages/Configuracoes/components/Campo/Campo"
import { Item } from "@/pages/Configuracoes/components/Item/Item"
import { Secao } from "@/pages/Configuracoes/components/Secao/Secao"
import { useConfiguracoes } from "@/pages/Configuracoes/Configuracoes.hook"
import {
    converterDensidade,
    converterIntervaloAtualizacao,
    converterTema,
    obterTituloDensidade,
    obterTituloIntervaloAtualizacao,
    obterTituloTema,
    OPCOES_DENSIDADE,
    OPCOES_INTERVALO_ATUALIZACAO,
    OPCOES_TEMA,
} from "@/pages/Configuracoes/Configuracoes.utils"

export const ConfiguracoesPage = () => {
    const {
        preferencias,
        runtimeDisponivel,
        informacoes,
        nomeDesenvolvedor,
        setNomeDesenvolvedor,
        salvarNomeDesenvolvedor,
        alterar,
        abrirPasta,
        exportarBackup,
        armazenamentoIsPending,
        preferenciasIsPending,
        preferenciasIsLoading,
        preferenciasIsError,
        preferenciasError,
        atualizar,
    } = useConfiguracoes()

    return (
        <div aria-busy={preferenciasIsPending || armazenamentoIsPending}>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Global DashowBoard preferences on this computer.
                </p>
            </div>

            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    Icon={Settings}
                    titulo="Settings are available in the desktop app"
                    subtitulo="Preferences and SQLite data are not persisted during browser development."
                />
            ) : preferenciasIsLoading ? (
                <TemplateEstado.Carregando
                    Icon={Settings}
                    titulo="Loading settings"
                    subtitulo="Loading preferences saved on this computer."
                    skeleton={{ quantidade: 6, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-52"
                />
            ) : preferenciasIsError ? (
                <TemplateEstado.Erro
                    titulo="Unable to load settings"
                    subtitulo={preferenciasError}
                    acao={<Button onClick={() => void atualizar()}>Try again</Button>}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Secao
                        titulo="Application"
                        descricao="General desktop behavior."
                    >
                        <Campo
                            titulo="Launch at startup"
                            controleId="iniciar-sistema"
                        >
                            <Checkbox
                                id="iniciar-sistema"
                                checked={preferencias.iniciarComSistema}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) =>
                                    void alterar("iniciarComSistema", Boolean(valor))
                                }
                            />
                        </Campo>
                        <Campo
                            titulo="Background monitoring"
                            controleId="segundo-plano"
                        >
                            <Checkbox
                                id="segundo-plano"
                                checked={preferencias.verificacaoSegundoPlano}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) =>
                                    void alterar("verificacaoSegundoPlano", Boolean(valor))
                                }
                            />
                        </Campo>
                        <Campo
                            titulo="Default interval"
                            controleId="intervalo-padrao"
                        >
                            <Select
                                value={String(preferencias.intervaloPadraoSegundos)}
                                disabled={preferenciasIsPending}
                                onValueChange={(valor) => {
                                    const intervalo = converterIntervaloAtualizacao(valor ?? "")
                                    if (intervalo) {
                                        void alterar("intervaloPadraoSegundos", intervalo)
                                    }
                                }}
                            >
                                <SelectTrigger id="intervalo-padrao">
                                    <SelectValue>{obterTituloIntervaloAtualizacao}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {OPCOES_INTERVALO_ATUALIZACAO.map((opcao) => (
                                        <SelectItem
                                            key={opcao.valor}
                                            value={String(opcao.valor)}
                                        >
                                            {opcao.titulo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Campo>
                    </Secao>
                    <Secao
                        titulo="Storage"
                        descricao="Local SQLite database."
                    >
                        <div className="space-y-1 text-sm">
                            <div className="text-muted-foreground">Path</div>
                            <div className="truncate rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs">
                                {informacoes.caminhoBanco}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={armazenamentoIsPending}
                                onClick={() => void abrirPasta()}
                            >
                                Open folder
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={armazenamentoIsPending}
                                onClick={() => void exportarBackup()}
                            >
                                Export backup
                            </Button>
                        </div>
                    </Secao>
                    <Secao
                        titulo="Notifications"
                        descricao="How the app notifies you."
                    >
                        <Campo
                            titulo="System notifications"
                            controleId="notificacoes-sistema"
                        >
                            <Checkbox
                                id="notificacoes-sistema"
                                checked={preferencias.notificacoesSistema}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) =>
                                    void alterar("notificacoesSistema", Boolean(valor))
                                }
                            />
                        </Campo>
                        <Campo
                            titulo="Play a sound when an incident is detected"
                            controleId="som-incidente"
                        >
                            <Checkbox
                                id="som-incidente"
                                checked={preferencias.somIncidente}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) => void alterar("somIncidente", Boolean(valor))}
                            />
                        </Campo>
                        <Campo
                            titulo="Incident count on the app icon"
                            controleId="badge-icone"
                        >
                            <Checkbox
                                id="badge-icone"
                                checked={preferencias.badgeIcone}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) => void alterar("badgeIcone", Boolean(valor))}
                            />
                        </Campo>
                    </Secao>
                    <Secao
                        titulo="Appearance"
                        descricao="Theme and density."
                    >
                        <Campo
                            titulo="Theme"
                            controleId="tema"
                        >
                            <Select
                                value={preferencias.tema}
                                disabled={preferenciasIsPending}
                                onValueChange={(valor) => {
                                    const tema = converterTema(valor ?? "")
                                    if (tema) void alterar("tema", tema)
                                }}
                            >
                                <SelectTrigger id="tema">
                                    <SelectValue>{obterTituloTema}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {OPCOES_TEMA.map((opcao) => (
                                        <SelectItem
                                            key={opcao.valor}
                                            value={opcao.valor}
                                        >
                                            {opcao.titulo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Campo>
                        <Campo
                            titulo="Density"
                            controleId="densidade"
                        >
                            <Select
                                value={preferencias.densidade}
                                disabled={preferenciasIsPending}
                                onValueChange={(valor) => {
                                    const densidade = converterDensidade(valor ?? "")
                                    if (densidade) void alterar("densidade", densidade)
                                }}
                            >
                                <SelectTrigger id="densidade">
                                    <SelectValue>{obterTituloDensidade}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {OPCOES_DENSIDADE.map((opcao) => (
                                        <SelectItem
                                            key={opcao.valor}
                                            value={opcao.valor}
                                        >
                                            {opcao.titulo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Campo>
                    </Secao>
                    <Secao
                        titulo="Local account"
                        descricao="Identity used in SQLite."
                    >
                        <div className="space-y-2">
                            <Label htmlFor="nome-desenvolvedor">Developer name</Label>
                            <Input
                                id="nome-desenvolvedor"
                                value={nomeDesenvolvedor}
                                disabled={preferenciasIsPending}
                                onChange={(evento) => setNomeDesenvolvedor(evento.target.value)}
                                onBlur={salvarNomeDesenvolvedor}
                            />
                        </div>
                    </Secao>
                    <Secao
                        titulo="About"
                        descricao="Version and diagnostics."
                    >
                        <dl className="space-y-1 text-sm">
                            <Item
                                titulo="Version"
                                valor={informacoes.versao}
                            />
                            <Item
                                titulo="Runtime"
                                valor={informacoes.runtime}
                            />
                            <Item
                                titulo="Build"
                                valor={informacoes.build}
                            />
                        </dl>
                    </Secao>
                </div>
            )}
        </div>
    )
}
