import type { BarChartProps } from "@/components/BarChart/BarChart.types"
import { formatarValorSerie, resumirSerie } from "@/lib/utils/chart"

export const BarChart = ({
    dados,
    titulo,
    unidade,
    descricao,
    altura = 120,
    cor = "var(--color-primary)",
    className,
}: BarChartProps) => {
    const resumo = resumirSerie(dados)
    const maximo = Math.max(resumo?.maximo ?? 0, 1)

    return (
        <div className={className}>
            <div
                className="flex items-end gap-1"
                style={{ height: altura }}
                aria-hidden="true"
            >
                {dados.map((valor, indice) => (
                    <div
                        key={`${indice}-${valor}`}
                        className="min-h-0.5 flex-1 rounded-t-sm transition-opacity hover:opacity-70"
                        style={{
                            height: `${(valor / maximo) * 100}%`,
                            backgroundColor: cor,
                            opacity: 0.6 + (valor / maximo) * 0.4,
                        }}
                    />
                ))}
            </div>
            <div className="sr-only">
                <p>
                    {titulo}. {descricao}.{" "}
                    {resumo
                        ? `Mínimo ${formatarValorSerie(resumo.minimo, unidade)}, média ${formatarValorSerie(resumo.media, unidade)} e máximo ${formatarValorSerie(resumo.maximo, unidade)}.`
                        : "Sem dados."}
                </p>
                {dados.length > 0 && (
                    <ol>
                        {dados.map((valor, indice) => (
                            <li key={`${indice}-${valor}`}>
                                Amostra {indice + 1} de {dados.length}: {formatarValorSerie(valor, unidade)}
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    )
}
