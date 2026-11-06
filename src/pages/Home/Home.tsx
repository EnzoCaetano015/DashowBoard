import { serviceTypeLabels, repositoryTagLabels } from "@/lib/utils/status"
import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    Filter,
    Plus,
    RotateCcw,
    Search,
    Server,
    ServerCrash,
} from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { FiltroSelect } from "@/components/FiltroSelect/FiltroSelect"
import { MetricCard } from "@/components/MetricCard/MetricCard"
import { ProjectCard } from "@/components/ProjectCard/ProjectCard"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { labelProvider, labelStatusProjeto } from "@/lib/utils/status"
import { useHome } from "@/pages/Home/Home.hook"
import type { FiltrosHome } from "@/pages/Home/Home.types"
import { STATUS_PROJETO_FILTROS } from "@/pages/Home/Home.utils"
import { NovoProjeto } from "@/pages/Home/modais/NovoProjeto/NovoProjeto"

export const HomePage = () => {
    const {
        modal,
        setModal,
        filtros,
        projetosFiltrados,
        quantidadeFiltrosAtivos,
        metricas,
        totalProjetos,
        runtimeDisponivel,
        isLoading,
        isFetching,
        isError,
        atualizar,
        alterarFiltro,
        limparFiltros,
    } = useHome()

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        The combined status of your projects and monitored services.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={() => setModal("novoProjeto", { open: true })}
                        disabled={!runtimeDisponivel}
                    >
                        <Plus />
                        New project
                    </Button>
                </div>
            </div>

            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    titulo="Local data is available in the desktop app"
                    subtitulo="Integrations and SQLite require the native runtime. You can preview the interface in the browser."
                    Icon={Boxes}
                />
            ) : isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 5, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-36 **:data-[slot=template-estado-skeletons]:grid-cols-2 **:data-[slot=template-estado-skeletons]:md:grid-cols-3 **:data-[slot=template-estado-skeletons]:xl:grid-cols-5"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Unable to load the dashboard"
                    subtitulo="Unable to load local projects and incidents."
                    acao={<Button onClick={() => void atualizar()}>Try again</Button>}
                />
            ) : !metricas ? (
                <TemplateEstado.Vazio
                    titulo="No data available"
                    subtitulo="There is no information to display on the dashboard yet."
                    Icon={Boxes}
                />
            ) : (
                metricas && (
                    <>
                        <div
                            className={cn(
                                "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5",
                                isFetching && "opacity-80"
                            )}
                        >
                            <MetricCard
                                titulo="Total projects"
                                valor={metricas.totalProjetos}
                                icone={<Boxes />}
                                tendencia={metricas.tendencias.projetos}
                                unidadeTendencia="projects"
                            />
                            <MetricCard
                                titulo="Healthy"
                                valor={metricas.online}
                                icone={<CheckCircle2 />}
                                destaque="success"
                                tendencia={metricas.tendencias.online}
                                unidadeTendencia="projects"
                            />
                            <MetricCard
                                titulo="Degraded"
                                valor={metricas.degradados}
                                icone={<AlertTriangle />}
                                destaque="warning"
                                tendencia={metricas.tendencias.degradados}
                                unidadeTendencia="projects"
                            />
                            <MetricCard
                                titulo="Offline"
                                valor={metricas.offline}
                                icone={<ServerCrash />}
                                destaque="destructive"
                                tendencia={metricas.tendencias.offline}
                                unidadeTendencia="projects"
                            />
                            <MetricCard
                                titulo="Monitored services"
                                valor={metricas.servicosMonitorados}
                                icone={<Server />}
                                destaque="info"
                                tendencia={metricas.tendencias.servicos}
                                unidadeTendencia="services"
                            />
                        </div>
                        <div className="mb-4 mt-8 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter className="size-4" />
                                Filters:
                            </div>
                            <div className="relative min-w-48 flex-1 sm:max-w-64">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={filtros.busca}
                                    onChange={(evento) => alterarFiltro("busca", evento.target.value)}
                                    placeholder="Filter projects on this page…"
                                    aria-label="Filter projects on this page"
                                    className="h-9 bg-surface-2 pl-8"
                                />
                            </div>
                            <FiltroSelect
                                value={filtros.status}
                                placeholder="Status"
                                ariaLabel="Filter by project status"
                                onValueChange={(valor) =>
                                    alterarFiltro("status", valor as FiltrosHome["status"])
                                }
                                opcoes={[
                                    ["todos", "All statuses"],
                                    ...STATUS_PROJETO_FILTROS.map(
                                        (valor) => [valor, labelStatusProjeto[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.provider}
                                placeholder="Provider"
                                ariaLabel="Filter by provider"
                                onValueChange={(valor) =>
                                    alterarFiltro("provider", valor as FiltrosHome["provider"])
                                }
                                opcoes={[
                                    ["todos", "All providers"],
                                    ...Object.values(Enum.Provider).map(
                                        (valor) => [valor, labelProvider[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.tipoServico}
                                placeholder="Type"
                                ariaLabel="Filter by service type"
                                onValueChange={(valor) =>
                                    alterarFiltro("tipoServico", valor as FiltrosHome["tipoServico"])
                                }
                                opcoes={[
                                    ["todos", "All types"],
                                    ...Object.values(Enum.TipoServico).map(
                                        (valor) => [valor, serviceTypeLabels[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.tagRepositorio}
                                placeholder="Tag"
                                ariaLabel="Filter by repository tag"
                                onValueChange={(valor) =>
                                    alterarFiltro(
                                        "tagRepositorio",
                                        valor as FiltrosHome["tagRepositorio"]
                                    )
                                }
                                opcoes={[
                                    ["todos", "All tags"],
                                    ...Object.values(Enum.TagRepositorio).map(
                                        (valor) => [valor, repositoryTagLabels[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.ordenacao}
                                placeholder="Sort"
                                ariaLabel="Sort projects"
                                onValueChange={(valor) =>
                                    alterarFiltro("ordenacao", valor as FiltrosHome["ordenacao"])
                                }
                                opcoes={[
                                    ["criticidade", "Most critical"],
                                    ["nome", "Name A–Z"],
                                    ["verificacao", "Recently checked"],
                                    ["incidentes", "Most active incidents"],
                                ]}
                                className="min-w-44"
                            />
                            {quantidadeFiltrosAtivos > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={limparFiltros}
                                >
                                    <RotateCcw />
                                    Clear filters ({quantidadeFiltrosAtivos})
                                </Button>
                            )}
                            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                {projetosFiltrados.length} of {totalProjetos} projects
                            </span>
                        </div>
                        {projetosFiltrados.length ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {projetosFiltrados.map((projeto) => (
                                    <ProjectCard
                                        key={projeto.id}
                                        projeto={projeto}
                                    />
                                ))}
                            </div>
                        ) : (
                            <TemplateEstado.Vazio
                                titulo="No projects found"
                                subtitulo="Adjust your filters to see more results."
                                Icon={Search}
                            />
                        )}
                    </>
                )
            )}
            <NovoProjeto
                open={modal.novoProjeto}
                onClose={() => setModal("novoProjeto", { open: false })}
            />
        </div>
    )
}
