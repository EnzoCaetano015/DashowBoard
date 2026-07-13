import { ArrowLeft, Telescope } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const NaoEncontradoPage = () => (
    <Card className="border-dashed">
        <CardContent className="py-16 text-center">
            <Telescope className="mx-auto size-10 text-primary" />
            <p className="mt-4 font-mono text-xs text-muted-foreground">404 · rota não encontrada</p>
            <h1 className="mt-1 text-xl font-semibold">Esta área não existe</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Volte à visão geral para continuar monitorando seus projetos.
            </p>
            <Button
                render={<Link to="/" />}
                nativeButton={false}
                className="mt-5"
            >
                <ArrowLeft />
                Voltar para visão geral
            </Button>
        </CardContent>
    </Card>
)
