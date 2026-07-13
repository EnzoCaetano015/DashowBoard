import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/AppSidebar"
import { TopBar } from "@/components/TopBar"

export const AppLayout = () => (
    <div className="dark flex h-dvh w-full overflow-hidden bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="scrollbar-thin flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    </div>
)
