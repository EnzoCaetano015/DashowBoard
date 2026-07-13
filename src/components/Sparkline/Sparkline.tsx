import type { SparklineProps } from "@/components/Sparkline/Sparkline.types"
import { cn } from "@/lib/utils"

export const Sparkline = ({
    dados,
    cor = "var(--color-primary)",
    altura = 48,
    preencher = true,
    className,
}: SparklineProps) => {
    if (!dados.length) return null

    const largura = 200
    const minimo = Math.min(...dados)
    const maximo = Math.max(...dados)
    const intervalo = maximo - minimo || 1
    const passoX = largura / Math.max(dados.length - 1, 1)
    const pontos = dados.map(
        (valor, indice) => [indice * passoX, altura - ((valor - minimo) / intervalo) * altura] as const
    )
    const caminho = pontos
        .map(([x, y], indice) => `${indice === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ")
    const area = `${caminho} L${largura},${altura} L0,${altura} Z`

    return (
        <svg
            viewBox={`0 0 ${largura} ${altura}`}
            preserveAspectRatio="none"
            className={cn("w-full", className)}
            style={{ height: altura }}
            aria-hidden
        >
            {preencher && (
                <path
                    d={area}
                    fill={cor}
                    fillOpacity={0.12}
                />
            )}
            <path
                d={caminho}
                fill="none"
                stroke={cor}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    )
}
