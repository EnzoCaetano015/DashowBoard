import { Bell, Menu, RefreshCw, Search } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { AppSidebar } from "@/components/AppSidebar/AppSidebar"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { useTopBar } from "@/components/TopBar/TopBar.hook"
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

export const TopBar = () => {
    const { busca, setBusca, ultimaAtualizacao, consultasAtivas, integracoes, atualizarTudo } =
        useTopBar()

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
            <div className="relative min-w-0 max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    type="search"
                    placeholder="Buscar projeto, serviço, repositório…"
                    className="h-9 bg-surface-2 pl-9 pr-14"
                    aria-label="Busca global"
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                    Ctrl K
                </kbd>
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
                className="hidden text-muted-foreground sm:inline-flex"
                aria-label="Notificações"
            >
                <Bell />
            </Button>
            <Button
                onClick={atualizarTudo}
                disabled={consultasAtivas > 0}
                className="gap-2 whitespace-nowrap"
            >
                <RefreshCw className={cn(consultasAtivas > 0 && "animate-spin")} />
                <span className="hidden sm:inline">Atualizar tudo</span>
            </Button>
        </header>
    )
}
