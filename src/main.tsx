import { QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"
import { queryClient } from "@/lib/config/query-client"
import { router } from "@/routes/routes"
import "@/index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <RouterProvider router={router} />
                <Toaster
                    theme="dark"
                    richColors
                    position="bottom-right"
                />
            </TooltipProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
