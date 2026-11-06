import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import type { SecaoProps } from "./Secao.types"

export const Secao = ({ titulo, descricao, children }: SecaoProps) => (
    <Card className="py-5">
        <CardHeader className="px-5">
            <CardTitle>
                <h2 className="text-sm">{titulo}</h2>
            </CardTitle>
            <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5">{children}</CardContent>
    </Card>
)
