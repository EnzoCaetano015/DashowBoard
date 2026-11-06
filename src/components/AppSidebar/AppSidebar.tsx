import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    FolderGit2,
    LayoutDashboard,
    Plug,
    Settings,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import logo from "@/img/logo-sidebar.png"

import { useAppSidebar } from "@/components/AppSidebar/AppSidebar.hook"
import type { AppSidebarProps } from "@/components/AppSidebar/AppSidebar.types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const navegacao = [
    { rota: "/", titulo: "Overview", Icone: LayoutDashboard, fim: true },
    { rota: "/projetos", titulo: "Projects", Icone: FolderGit2 },
    { rota: "/incidentes", titulo: "Incidents", Icone: AlertTriangle },
    { rota: "/integracoes", titulo: "Integrations", Icone: Plug },
    { rota: "/configuracoes", titulo: "Settings", Icone: Settings },
] as const

export const AppSidebar = ({ modo = "desktop" }: AppSidebarProps) => {
    const { compacta: preferenciaCompacta, alternarSidebar, alternarSidebarDesabilitado } =
        useAppSidebar()
    const ehMobile = modo === "mobile"
    const compacta = !ehMobile && preferenciaCompacta

    return (
        <aside
            className={cn(
                "glass-panel relative z-20 flex h-full shrink-0 flex-col text-sidebar-foreground transition-[width]",
                ehMobile
                    ? "w-full rounded-none border-0 shadow-none backdrop-filter-none"
                    : "m-3 mr-0 hidden h-[calc(100%-1.5rem)] rounded-3xl md:flex",
                !ehMobile && (compacta ? "w-[4.5rem]" : "w-60")
            )}
        >
            <div
                className={cn(
                    "flex h-20 shrink-0 items-center gap-2.5 px-3",
                    compacta && !ehMobile && "justify-center px-2"
                )}
            >
                <img
                    src={logo}
                    alt=""
                    aria-hidden="true"
                    className="size-12 shrink-0 object-contain drop-shadow-lg"
                    width={48}
                    height={48}
                />
                {(!compacta || ehMobile) && (
                    <div className="min-w-0 leading-tight">
                        <strong className="block truncate text-base tracking-tight">DashowBoard</strong>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Desktop · v0.1
                        </span>
                    </div>
                )}
            </div>
            <nav
                className="scrollbar-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-2"
                aria-label="Main navigation"
            >
                {navegacao.map((item) => {
                    const link = (
                        <NavLink
                            key={item.rota}
                            to={item.rota}
                            end={"fim" in item ? item.fim : false}
                            aria-label={compacta && !ehMobile ? item.titulo : undefined}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-white/20"
                                        : "text-muted-foreground hover:bg-sidebar-accent/45 hover:text-sidebar-foreground",
                                    compacta && !ehMobile && "justify-center px-2"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.Icone className="size-[1.1rem] shrink-0" />
                                    {(!compacta || ehMobile) && <span>{item.titulo}</span>}
                                    {isActive && (!compacta || ehMobile) && (
                                        <span className="ml-auto size-1.5 rounded-full bg-primary" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    )

                    return compacta && !ehMobile ? (
                        <Tooltip key={item.rota}>
                            <TooltipTrigger render={link} />
                            <TooltipContent side="right">{item.titulo}</TooltipContent>
                        </Tooltip>
                    ) : (
                        link
                    )
                })}
            </nav>
            {!ehMobile && (
                <div className="px-3 pb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground"
                        onClick={alternarSidebar}
                        disabled={alternarSidebarDesabilitado}
                        aria-label={compacta ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {compacta ? (
                            <ChevronRight />
                        ) : (
                            <>
                                <ChevronLeft /> Collapse
                            </>
                        )}
                    </Button>
                </div>
            )}
            <div
                className={cn(
                    "mx-3 mb-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/30 px-3 py-3 text-xs text-muted-foreground",
                    compacta && !ehMobile && "px-2 text-center"
                )}
            >
                {compacta && !ehMobile ? (
                    <span
                        className="status-dot bg-success text-success"
                        role="status"
                        aria-label="Local SQLite available"
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <span>Local mode</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="status-dot bg-success text-success" />
                                SQLite
                            </span>
                        </div>
                        <div className="mt-1 truncate font-mono text-[10px] opacity-60">
                            tauri://dashowboard
                        </div>
                    </>
                )}
            </div>
        </aside>
    )
}
