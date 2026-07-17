import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"

import { AppSidebar } from "@/components/AppSidebar/AppSidebar"
import { TopBar } from "@/components/TopBar/TopBar"
import { useMonitoramentoProjetos } from "@/lib/hooks/useMonitoramentoProjetos"
import { usePreferenciasGlobais } from "@/lib/hooks/usePreferenciasGlobais"

export const AppLayout = () => {
    const { temaEfetivo } = usePreferenciasGlobais()
    useMonitoramentoProjetos()

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar />
                <main className="scrollbar-thin flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
            <Toaster
                theme={temaEfetivo}
                richColors
                position="bottom-right"
            />
        </div>
    )
}
