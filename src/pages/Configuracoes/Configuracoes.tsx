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
                <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Preferências globais do DashowBoard neste computador.
                </p>
            </div>

            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    Icon={Settings}
                    titulo="Configurações disponíveis no aplicativo desktop"
                    subtitulo="As preferências e o SQLite não são persistidos durante o desenvolvimento no navegador."
                />
            ) : preferenciasIsLoading ? (
                <TemplateEstado.Carregando
                    Icon={Settings}
                    titulo="Carregando configurações"
                    subtitulo="Consultando as preferências salvas neste computador."
                    skeleton={{ quantidade: 6, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-52"
                />
            ) : preferenciasIsError ? (
                <TemplateEstado.Erro
                    titulo="Falha ao carregar configurações"
                    subtitulo={preferenciasError}
                    acao={<Button onClick={() => void atualizar()}>Tentar novamente</Button>}
                />
            ) : (
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
                                checked={preferencias.iniciarComSistema}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) =>
                                    void alterar("iniciarComSistema", Boolean(valor))
                                }
                            />
                        </Campo>
                        <Campo
                            titulo="Verificação em segundo plano"
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
                            titulo="Intervalo padrão"
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
                        titulo="Armazenamento"
                        descricao="Banco local em SQLite."
                    >
                        <div className="space-y-1 text-sm">
                            <div className="text-muted-foreground">Caminho</div>
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
                                Abrir pasta
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={armazenamentoIsPending}
                                onClick={() => void exportarBackup()}
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
                                checked={preferencias.notificacoesSistema}
                                disabled={preferenciasIsPending}
                                onCheckedChange={(valor) =>
                                    void alterar("notificacoesSistema", Boolean(valor))
                                }
                            />
                        </Campo>
                        <Campo
                            titulo="Som ao detectar incidente"
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
                            titulo="Badge de contagem no ícone"
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
                        titulo="Aparência"
                        descricao="Tema e densidade."
                    >
                        <Campo
                            titulo="Tema"
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
                            titulo="Densidade"
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
                        titulo="Conta local"
                        descricao="Identificação usada no SQLite."
                    >
                        <div className="space-y-2">
                            <Label htmlFor="nome-desenvolvedor">Nome do desenvolvedor</Label>
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
                        titulo="Sobre"
                        descricao="Versão e diagnóstico."
                    >
                        <dl className="space-y-1 text-sm">
                            <Item
                                titulo="Versão"
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
