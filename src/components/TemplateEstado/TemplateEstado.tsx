import { CircleQuestionMark, TriangleAlert } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { CarregandoProps, ErroProps, VazioProps } from "./TemplateEstado.types"

export const Carregando = ({ skeleton, Icon, className, titulo, subtitulo }: CarregandoProps) => {
    const exibirCabecalho = Boolean(Icon || titulo || subtitulo)

    return (
        <div className={cn("space-y-4", className)}>
            {exibirCabecalho && (
                <div className="text-center">
                    {Icon && <Icon className="mx-auto size-8 animate-pulse text-muted-foreground" />}
                    {titulo && <h2 className="mt-3 font-medium">{titulo}</h2>}
                    {subtitulo && <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>}
                </div>
            )}
            <div
                data-slot="template-estado-skeletons"
                className={cn(
                    skeleton.orientacao === "horizontal"
                        ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                        : "space-y-3"
                )}
            >
                {Array.from({ length: skeleton.quantidade }, (_, indice) => (
                    <Skeleton
                        key={indice}
                        className="h-28"
                    />
                ))}
            </div>
        </div>
    )
}

export const Vazio = ({
    titulo = "Nenhum item encontrado",
    subtitulo = "Tente novamente ou revise os termos de busca.",
    Icon = CircleQuestionMark,
    acao,
    className,
}: VazioProps) => (
    <Card
        data-slot="template-estado-vazio"
        className={cn("border-dashed bg-card/50", className)}
    >
        <CardContent className="py-12 text-center">
            <Icon className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-3 font-medium">{titulo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
            {acao && <div className="mt-4 flex justify-center gap-2">{acao}</div>}
        </CardContent>
    </Card>
)

export const Erro = ({ titulo, subtitulo, Icon = TriangleAlert, acao, className }: ErroProps) => (
    <Card
        data-slot="template-estado-erro"
        className={cn("border-destructive/40 bg-destructive/5", className)}
    >
        <CardContent className="py-12 text-center">
            <Icon className="mx-auto size-8 text-destructive" />
            <h2 className="mt-3 font-medium">{titulo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
            {acao && <div className="mt-4 flex justify-center gap-2">{acao}</div>}
        </CardContent>
    </Card>
)
