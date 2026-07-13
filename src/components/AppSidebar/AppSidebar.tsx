import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    FolderGit2,
    LayoutDashboard,
    Plug,
    Settings,
    Terminal,
} from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"

import type { AppSidebarProps } from "@/components/AppSidebar/AppSidebar.types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navegacao = [
    { rota: "/", titulo: "Visão geral", Icone: LayoutDashboard, fim: true },
    { rota: "/projetos", titulo: "Projetos", Icone: FolderGit2 },
    { rota: "/incidentes", titulo: "Incidentes", Icone: AlertTriangle },
    { rota: "/integracoes", titulo: "Integrações", Icone: Plug },
    { rota: "/configuracoes", titulo: "Configurações", Icone: Settings },
] as const

export const AppSidebar = ({ modo = "desktop" }: AppSidebarProps) => {
    const [compacta, setCompacta] = useState(false)
    const ehMobile = modo === "mobile"

    return (
        <aside
            className={cn(
                "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width]",
                ehMobile ? "w-full border-r-0" : "hidden md:flex",
                !ehMobile && (compacta ? "w-16" : "w-60")
            )}
        >
            <div
                className={cn(
                    "flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4",
                    compacta && !ehMobile && "justify-center px-2"
                )}
            >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
                    <Terminal className="size-4 text-primary" />
                </span>
                {(!compacta || ehMobile) && (
                    <div className="min-w-0 leading-tight">
                        <strong className="block truncate text-sm tracking-tight">DashwoBoard</strong>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Desktop · v0.1
                        </span>
                    </div>
                )}
            </div>
            <nav
                className="flex-1 space-y-1 px-2 py-3"
                aria-label="Navegação principal"
            >
                {navegacao.map((item) => (
                    <NavLink
                        key={item.rota}
                        to={item.rota}
                        end={"fim" in item ? item.fim : false}
                        title={compacta && !ehMobile ? item.titulo : undefined}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                                compacta && !ehMobile && "justify-center px-2"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.Icone className="size-4 shrink-0" />
                                {(!compacta || ehMobile) && <span>{item.titulo}</span>}
                                {isActive && (!compacta || ehMobile) && (
                                    <span className="ml-auto size-1.5 rounded-full bg-primary" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            {!ehMobile && (
                <div className="px-2 pb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground"
                        onClick={() => setCompacta((valor) => !valor)}
                        aria-label={compacta ? "Expandir barra lateral" : "Recolher barra lateral"}
                    >
                        {compacta ? (
                            <ChevronRight />
                        ) : (
                            <>
                                <ChevronLeft /> Recolher
                            </>
                        )}
                    </Button>
                </div>
            )}
            <div
                className={cn(
                    "border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground",
                    compacta && !ehMobile && "px-2 text-center"
                )}
            >
                {compacta && !ehMobile ? (
                    <span
                        className="status-dot bg-success text-success"
                        title="SQLite local disponível"
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <span>Modo local</span>
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
