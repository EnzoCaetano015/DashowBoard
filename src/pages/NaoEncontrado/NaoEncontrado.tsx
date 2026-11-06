import { ArrowLeft, Telescope } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const NaoEncontradoPage = () => (
    <Card className="border-dashed">
        <CardContent className="py-16 text-center">
            <Telescope className="mx-auto size-10 text-primary" />
            <p className="mt-4 font-mono text-xs text-muted-foreground">404 · route not found</p>
            <h1 className="mt-1 text-xl font-semibold">This page does not exist</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Return to the overview to keep monitoring your projects.
            </p>
            <Button
                render={<Link to="/" />}
                nativeButton={false}
                className="mt-5"
            >
                <ArrowLeft />
                Back to overview
            </Button>
        </CardContent>
    </Card>
)
