import type { BarChartProps } from "@/components/BarChart/BarChart.types"
import { cn } from "@/lib/utils"

export const BarChart = ({
    dados,
    altura = 120,
    cor = "var(--color-primary)",
    className,
}: BarChartProps) => {
    const maximo = Math.max(...dados, 1)

    return (
        <div
            className={cn("flex items-end gap-1", className)}
            style={{ height: altura }}
            role="img"
            aria-label="Gráfico de barras da série histórica"
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
                    title={`${valor}`}
                />
            ))}
        </div>
    )
}
