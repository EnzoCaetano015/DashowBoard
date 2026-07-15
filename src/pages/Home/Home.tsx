import {
    AlertTriangle,
    Boxes,
    Bug,
    CheckCircle2,
    Filter,
    Search,
    Server,
    ServerCrash,
} from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { MetricCard } from "@/components/MetricCard"
import { NewProjectDialog } from "@/components/NewProjectDialog"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import type { RetryProps } from "@/lib/types/common"
import { cn } from "@/lib/utils"
import { labelProvider, labelStatusProjeto } from "@/lib/utils/status"
import { useHome } from "@/pages/Home/Home.hook"
import type { FiltroSelectProps, FiltrosHome } from "@/pages/Home/Home.types"

export const HomePage = () => {
    const home = useHome()

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Estado agregado dos seus projetos e serviços monitorados.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-md border border-border bg-surface-2 p-0.5 text-xs">
                        <span className="px-2 text-muted-foreground">Incidentes:</span>
                        {PERIODOS_MONITORAMENTO.map((periodo) => (
                            <Button
                                key={periodo}
                                variant="ghost"
                                size="xs"
                                onClick={() => home.setPeriodo(periodo)}
                                className={cn(
                                    home.periodo === periodo &&
                                        "bg-primary/20 text-primary hover:bg-primary/25"
                                )}
                            >
                                {periodo} dias
                            </Button>
                        ))}
                    </div>
                    <NewProjectDialog />
                </div>
            </div>

            {home.isLoading ? (
                <HomeSkeleton />
            ) : home.isError ? (
                <EstadoErro onRetry={() => void home.tentarNovamente()} />
            ) : (
                home.metricas && (
                    <>
                        <div
                            className={cn(
                                "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6",
                                home.isFetching && "opacity-80"
                            )}
                        >
                            <MetricCard
                                titulo="Total de projetos"
                                valor={home.metricas.totalProjetos}
                                icone={<Boxes />}
                                tendencia={home.metricas.tendencias.projetos}
                            />
                            <MetricCard
                                titulo="Saudáveis"
                                valor={home.metricas.saudaveis}
                                icone={<CheckCircle2 />}
                                destaque="success"
                                tendencia={home.metricas.tendencias.saudaveis}
                            />
                            <MetricCard
                                titulo="Degradados"
                                valor={home.metricas.degradados}
                                icone={<AlertTriangle />}
                                destaque="warning"
                                tendencia={home.metricas.tendencias.degradados}
                            />
                            <MetricCard
                                titulo="Offline"
                                valor={home.metricas.offline}
                                icone={<ServerCrash />}
                                destaque="destructive"
                                tendencia={home.metricas.tendencias.offline}
                            />
                            <MetricCard
                                titulo="Serviços monitorados"
                                valor={home.metricas.servicosMonitorados}
                                icone={<Server />}
                                destaque="info"
                                tendencia={home.metricas.tendencias.servicos}
                            />
                            <MetricCard
                                titulo={`Incidentes · ${home.periodo}d`}
                                valor={home.metricas.incidentes}
                                dica="detectados"
                                icone={<Bug />}
                                destaque="destructive"
                                tendencia={home.metricas.tendencias.incidentes}
                            />
                        </div>
                        <div className="mb-4 mt-8 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="size-4" />
                                Filtros:
                            </div>
                            <div className="relative min-w-48 flex-1 sm:max-w-64">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={home.filtros.busca}
                                    onChange={(evento) =>
                                        home.alterarFiltro("busca", evento.target.value)
                                    }
                                    placeholder="Nome do projeto…"
                                    className="h-9 bg-surface-2 pl-8"
                                />
                            </div>
                            <FiltroSelect
                                value={home.filtros.status}
                                placeholder="Status"
                                onValueChange={(valor) =>
                                    home.alterarFiltro("status", valor as FiltrosHome["status"])
                                }
                                opcoes={[
                                    ["todos", "Todos status"],
                                    ...Object.values(Enum.StatusProjeto).map(
                                        (valor) => [valor, labelStatusProjeto[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={home.filtros.provider}
                                placeholder="Provider"
                                onValueChange={(valor) =>
                                    home.alterarFiltro("provider", valor as FiltrosHome["provider"])
                                }
                                opcoes={[
                                    ["todos", "Todos providers"],
                                    ...Object.values(Enum.Provider).map(
                                        (valor) => [valor, labelProvider[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={home.filtros.tipoServico}
                                placeholder="Tipo"
                                onValueChange={(valor) =>
                                    home.alterarFiltro(
                                        "tipoServico",
                                        valor as FiltrosHome["tipoServico"]
                                    )
                                }
                                opcoes={[
                                    ["todos", "Todos tipos"],
                                    ...Object.values(Enum.TipoServico).map(
                                        (valor) => [valor, valor] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={home.filtros.tagRepositorio}
                                placeholder="Tag"
                                onValueChange={(valor) =>
                                    home.alterarFiltro(
                                        "tagRepositorio",
                                        valor as FiltrosHome["tagRepositorio"]
                                    )
                                }
                                opcoes={[
                                    ["todos", "Todas tags"],
                                    ...Object.values(Enum.TagRepositorio).map(
                                        (valor) => [valor, valor] as const
                                    ),
                                ]}
                            />
                            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                {home.projetosFiltrados.length} de {home.totalProjetos} projetos
                            </span>
                        </div>
                        {home.projetosFiltrados.length ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {home.projetosFiltrados.map((projeto) => (
                                    <ProjectCard
                                        key={projeto.id}
                                        projeto={projeto}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed bg-card/50">
                                <CardContent className="py-12 text-center">
                                    <Search className="mx-auto size-8 text-muted-foreground" />
                                    <h2 className="mt-3 font-medium">Nenhum projeto encontrado</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Ajuste os filtros para ampliar os resultados.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )
            )}
        </div>
    )
}

const FiltroSelect = ({ value, placeholder, onValueChange, opcoes }: FiltroSelectProps) => (
    <Select
        value={value}
        onValueChange={(valor) => valor && onValueChange(valor)}
    >
        <SelectTrigger className="h-9 min-w-36 bg-surface-2">
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {opcoes.map(([valor, titulo]) => (
                <SelectItem
                    key={valor}
                    value={valor}
                >
                    {titulo}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
)

const HomeSkeleton = () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, indice) => (
            <Skeleton
                key={indice}
                className="h-36 rounded-lg"
            />
        ))}
    </div>
)

const EstadoErro = ({ onRetry }: RetryProps) => (
    <Card className="border-destructive/40">
        <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto size-8 text-destructive" />
            <h2 className="mt-3 font-medium">Não foi possível carregar o dashboard</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                A consulta mockada falhou inesperadamente.
            </p>
            <Button
                className="mt-4"
                onClick={onRetry}
            >
                Tentar novamente
            </Button>
        </CardContent>
    </Card>
)
