import { createHashRouter } from "react-router-dom"
import { lazy, Suspense, type ReactNode } from "react"

import { AppLayout } from "@/components/AppLayout"
import { Skeleton } from "@/components/ui/skeleton"

const HomePage = lazy(() => import("@/pages/Home/Home").then((modulo) => ({ default: modulo.HomePage })))
const ProjetosPage = lazy(() =>
    import("@/pages/Projetos/Projetos").then((modulo) => ({ default: modulo.ProjetosPage }))
)
const DetalhesProjetoPage = lazy(() =>
    import("@/pages/DetalhesProjeto/DetalhesProjeto").then((modulo) => ({
        default: modulo.DetalhesProjetoPage,
    }))
)
const IncidentesPage = lazy(() =>
    import("@/pages/Incidentes/Incidentes").then((modulo) => ({ default: modulo.IncidentesPage }))
)
const IntegracoesPage = lazy(() =>
    import("@/pages/Integracoes/Integracoes").then((modulo) => ({ default: modulo.IntegracoesPage }))
)
const ConfiguracoesPage = lazy(() =>
    import("@/pages/Configuracoes/Configuracoes").then((modulo) => ({
        default: modulo.ConfiguracoesPage,
    }))
)
const NaoEncontradoPage = lazy(() =>
    import("@/pages/NaoEncontrado/NaoEncontrado").then((modulo) => ({
        default: modulo.NaoEncontradoPage,
    }))
)

const exibir = (pagina: ReactNode) => (
    <Suspense
        fallback={
            <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-80" />
            </div>
        }
    >
        {pagina}
    </Suspense>
)

export const router = createHashRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: exibir(<HomePage />) },
            { path: "/projetos", element: exibir(<ProjetosPage />) },
            { path: "/projetos/:id", element: exibir(<DetalhesProjetoPage />) },
            { path: "/incidentes", element: exibir(<IncidentesPage />) },
            { path: "/integracoes", element: exibir(<IntegracoesPage />) },
            { path: "/configuracoes", element: exibir(<ConfiguracoesPage />) },
            { path: "*", element: exibir(<NaoEncontradoPage />) },
        ],
    },
])
