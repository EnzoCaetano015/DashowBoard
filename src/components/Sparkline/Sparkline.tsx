import type { SparklineProps } from "@/components/Sparkline/Sparkline.types"
import { cn } from "@/lib/utils"
import { formatarValorSerie, resumirSerie } from "@/lib/utils/chart"

export const Sparkline = ({
    dados,
    titulo,
    unidade,
    descricao,
    cor = "var(--color-primary)",
    altura = 48,
    preencher = true,
    className,
}: SparklineProps) => {
    const resumo = resumirSerie(dados)
    if (!resumo) return <span className="sr-only">{titulo}. {descricao}. Sem dados.</span>

    const largura = 200
    const minimo = resumo.minimo
    const maximo = resumo.maximo
    const valoresIguais = maximo === minimo
    const intervalo = maximo - minimo || 1
    const passoX = largura / Math.max(dados.length - 1, 1)
    const pontos = dados.map(
        (valor, indice) =>
            [
                indice * passoX,
                valoresIguais ? altura / 2 : altura - ((valor - minimo) / intervalo) * altura,
            ] as const
    )
    const caminho = pontos
        .map(([x, y], indice) => `${indice === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ")
    const area = `${caminho} L${largura},${altura} L0,${altura} Z`

    return (
        <div className={className}>
            <svg
                viewBox={`0 0 ${largura} ${altura}`}
                preserveAspectRatio="none"
                className={cn("w-full")}
                style={{ height: altura }}
                aria-hidden="true"
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
            <div className="sr-only">
                <p>
                    {titulo}. {descricao}. Mínimo {formatarValorSerie(resumo.minimo, unidade)}, média{" "}
                    {formatarValorSerie(resumo.media, unidade)} e máximo{" "}
                    {formatarValorSerie(resumo.maximo, unidade)}.
                </p>
                <ol>
                    {dados.map((valor, indice) => (
                        <li key={`${indice}-${valor}`}>
                            Amostra {indice + 1} de {dados.length}: {formatarValorSerie(valor, unidade)}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}
