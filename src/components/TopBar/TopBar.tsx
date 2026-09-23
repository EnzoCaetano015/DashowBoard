import { Bell, FolderGit2, GitBranch, Menu, RefreshCw, Search, Server } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { AppSidebar } from "@/components/AppSidebar/AppSidebar"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { useTopBar } from "@/components/TopBar/TopBar.hook"
import type { CategoriaResultadoBuscaGlobal } from "@/components/TopBar/TopBar.types"
import { LABEL_CATEGORIA_BUSCA } from "@/components/TopBar/TopBar.utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { labelProvider } from "@/lib/utils/status"

const CATEGORIAS_BUSCA: CategoriaResultadoBuscaGlobal[] = [
    "projeto",
    "servico",
    "repositorio",
]

export const TopBar = () => {
    const {
        busca,
        painelBuscaAberto,
        indiceSelecionado,
        resultadosBusca,
        projetosIsLoading,
        inputBuscaRef,
        containerBuscaRef,
        ultimaAtualizacao,
        atualizacaoIsPending,
        integracoes,
        incidentesAtivos,
        alterarBusca,
        abrirPainelBusca,
        controlarTecladoBusca,
        selecionarResultado,
        abrirIncidentes,
        atualizarTudo,
    } = useTopBar()

    return (
        <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-surface-1/80 px-3 backdrop-blur md:px-5">
            <Sheet>
                <SheetTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            aria-label="Abrir navegação"
                        />
                    }
                >
                    <Menu />
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="w-64 gap-0 border-sidebar-border bg-sidebar p-0"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navegação</SheetTitle>
                        <SheetDescription>Links principais do DashowBoard</SheetDescription>
                    </SheetHeader>
                    <AppSidebar modo="mobile" />
                </SheetContent>
            </Sheet>
            <div
                ref={containerBuscaRef}
                className="relative min-w-0 max-w-xl flex-1"
            >
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputBuscaRef}
                    value={busca}
                    onChange={(evento) => alterarBusca(evento.target.value)}
                    onFocus={abrirPainelBusca}
                    onKeyDown={controlarTecladoBusca}
                    type="search"
                    placeholder="Buscar projeto, serviço, repositório…"
                    className="h-9 bg-surface-2 pl-9 pr-14"
                    aria-label="Busca global"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={painelBuscaAberto}
                    aria-controls="resultados-busca-global"
                    aria-activedescendant={
                        painelBuscaAberto && resultadosBusca[indiceSelecionado]
                            ? `resultado-busca-${resultadosBusca[indiceSelecionado].id}`
                            : undefined
                    }
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                    Ctrl K
                </kbd>
                {painelBuscaAberto && (
                    <div
                        id="resultados-busca-global"
                        role="listbox"
                        aria-label="Resultados da busca global"
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg"
                    >
                        {projetosIsLoading ? (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                Carregando projetos...
                            </p>
                        ) : resultadosBusca.length === 0 ? (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                Nenhum projeto, serviço ou repositório encontrado.
                            </p>
                        ) : (
                            CATEGORIAS_BUSCA.map((categoria) => {
                                const resultados = resultadosBusca.filter(
                                    (resultado) => resultado.categoria === categoria
                                )
                                if (resultados.length === 0) return null

                                return (
                                    <div
                                        key={categoria}
                                        className="not-first:mt-2"
                                    >
                                        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                            {LABEL_CATEGORIA_BUSCA[categoria]}
                                        </div>
                                        {resultados.map((resultado) => {
                                            const indice = resultadosBusca.indexOf(resultado)
                                            const Icon =
                                                categoria === "projeto"
                                                    ? FolderGit2
                                                    : categoria === "servico"
                                                      ? Server
                                                      : GitBranch

                                            return (
                                                <button
                                                    key={resultado.id}
                                                    id={`resultado-busca-${resultado.id}`}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={indice === indiceSelecionado}
                                                    onClick={() => selecionarResultado(resultado)}
                                                    className={cn(
                                                        "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left outline-none",
                                                        indice === indiceSelecionado
                                                            ? "bg-accent text-accent-foreground"
                                                            : "hover:bg-accent/60"
                                                    )}
                                                >
                                                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-medium">
                                                            {resultado.titulo}
                                                        </span>
                                                        <span className="block truncate text-xs text-muted-foreground">
                                                            {resultado.descricao}
                                                        </span>
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">
                {integracoes.map((integracao) => (
                    <Tooltip key={integracao.provider}>
                        <TooltipTrigger
                            className={cn(
                                "flex size-8 items-center justify-center rounded-md border bg-surface-2 text-muted-foreground",
                                integracao.status === Enum.StatusIntegracao.Erro &&
                                    "border-destructive/40 bg-destructive/10 text-destructive"
                            )}
                            aria-label={`${labelProvider[integracao.provider]}: ${integracao.status}`}
                        >
                            <ProviderIcon provider={integracao.provider} />
                        </TooltipTrigger>
                        <TooltipContent>
                            {labelProvider[integracao.provider]} ·{" "}
                            {integracao.status === Enum.StatusIntegracao.Conectado
                                ? "conectado"
                                : (integracao.erro ?? "desconectado")}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
            <div className="hidden text-right leading-tight xl:block">
                <div className="text-xs text-muted-foreground">Última atualização</div>
                <div className="font-mono text-xs tabular-nums">{ultimaAtualizacao}</div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="relative hidden text-muted-foreground sm:inline-flex"
                aria-label={
                    incidentesAtivos
                        ? `Abrir incidentes, ${incidentesAtivos} ativo${incidentesAtivos === 1 ? "" : "s"}`
                        : "Abrir incidentes"
                }
                onClick={abrirIncidentes}
            >
                <Bell />
                {incidentesAtivos > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-4 text-destructive-foreground">
                        {incidentesAtivos > 99 ? "99+" : incidentesAtivos}
                    </span>
                )}
            </Button>
            <Button
                onClick={atualizarTudo}
                disabled={atualizacaoIsPending}
                className="gap-2 whitespace-nowrap"
            >
                <RefreshCw className={cn(atualizacaoIsPending && "animate-spin")} />
                <span className="hidden sm:inline">Atualizar tudo</span>
            </Button>
        </header>
    )
}
