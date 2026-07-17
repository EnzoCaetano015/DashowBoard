import {
    AlertTriangle,
    Boxes,
    Bug,
    CheckCircle2,
    CircleHelp,
    Filter,
    Plus,
    Search,
    Server,
    ServerCrash,
} from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { MetricCard } from "@/components/MetricCard/MetricCard"
import { ProjectCard } from "@/components/ProjectCard/ProjectCard"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import { cn } from "@/lib/utils"
import { labelProvider, labelStatusProjeto } from "@/lib/utils/status"
import { FiltroSelect } from "@/pages/Home/components/FiltroSelect/FiltroSelect"
import { useHome } from "@/pages/Home/Home.hook"
import type { FiltrosHome } from "@/pages/Home/Home.types"
import { NovoProjeto } from "@/pages/Home/modais/NovoProjeto/NovoProjeto"

export const HomePage = () => {
    const {
        modal,
        setModal,
        periodo,
        filtros,
        projetosFiltrados,
        metricas,
        totalProjetos,
        runtimeDisponivel,
        isLoading,
        isFetching,
        isError,
        atualizar,
        setPeriodo,
        alterarFiltro,
    } = useHome()

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
                        {PERIODOS_MONITORAMENTO.map((periodoMonitoramento) => (
                            <Button
                                key={periodoMonitoramento}
                                variant="ghost"
                                size="xs"
                                onClick={() => setPeriodo(periodoMonitoramento)}
                                className={cn(
                                    periodo === periodoMonitoramento &&
                                        "bg-primary/20 text-primary hover:bg-primary/25"
                                )}
                            >
                                {periodoMonitoramento} dias
                            </Button>
                        ))}
                    </div>
                    <Button
                        onClick={() => setModal("novoProjeto", { open: true })}
                        disabled={!runtimeDisponivel}
                    >
                        <Plus />
                        Novo projeto
                    </Button>
                </div>
            </div>

            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    titulo="Dados locais disponíveis no aplicativo desktop"
                    subtitulo="Integrações e SQLite exigem o runtime nativo. O layout permanece disponível no navegador."
                    Icon={Boxes}
                />
            ) : isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 6, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-36 **:data-[slot=template-estado-skeletons]:grid-cols-2 **:data-[slot=template-estado-skeletons]:md:grid-cols-3 **:data-[slot=template-estado-skeletons]:xl:grid-cols-6"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Falha ao carregar o dashboard"
                    subtitulo="Não foi possível consultar os projetos e incidentes locais."
                    acao={<Button onClick={() => void atualizar()}>Tentar novamente</Button>}
                />
            ) : !metricas ? (
                <TemplateEstado.Vazio
                    titulo="Nenhum dado disponível"
                    subtitulo="Ainda não há informações para exibir no dashboard."
                    Icon={Boxes}
                />
            ) : (
                metricas && (
                    <>
                        <div
                            className={cn(
                                "grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8",
                                isFetching && "opacity-80"
                            )}
                        >
                            <MetricCard
                                titulo="Total de projetos"
                                valor={metricas.totalProjetos}
                                icone={<Boxes />}
                                tendencia={metricas.tendencias.projetos}
                            />
                            <MetricCard
                                titulo="Saudáveis"
                                valor={metricas.saudaveis}
                                icone={<CheckCircle2 />}
                                destaque="success"
                                tendencia={metricas.tendencias.saudaveis}
                            />
                            <MetricCard
                                titulo="Degradados"
                                valor={metricas.degradados}
                                icone={<AlertTriangle />}
                                destaque="warning"
                                tendencia={metricas.tendencias.degradados}
                            />
                            <MetricCard
                                titulo="Offline"
                                valor={metricas.offline}
                                icone={<ServerCrash />}
                                destaque="destructive"
                                tendencia={metricas.tendencias.offline}
                            />
                            <MetricCard
                                titulo="Desconhecidos"
                                valor={metricas.desconhecidos}
                                icone={<CircleHelp />}
                                tendencia={metricas.tendencias.desconhecidos}
                            />
                            <MetricCard
                                titulo="Serviços monitorados"
                                valor={metricas.servicosMonitorados}
                                icone={<Server />}
                                destaque="info"
                                tendencia={metricas.tendencias.servicos}
                            />
                            <MetricCard
                                titulo="Incidentes abertos"
                                valor={metricas.incidentesAbertos}
                                dica="ativos"
                                icone={<Bug />}
                                destaque="destructive"
                                tendencia={metricas.tendencias.incidentesAbertos}
                            />
                            <MetricCard
                                titulo={`Incidentes · ${periodo}d`}
                                valor={metricas.incidentes}
                                dica="detectados"
                                icone={<Bug />}
                                destaque="destructive"
                                tendencia={metricas.tendencias.incidentes}
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
                                    value={filtros.busca}
                                    onChange={(evento) => alterarFiltro("busca", evento.target.value)}
                                    placeholder="Nome do projeto…"
                                    className="h-9 bg-surface-2 pl-8"
                                />
                            </div>
                            <FiltroSelect
                                value={filtros.status}
                                placeholder="Status"
                                onValueChange={(valor) =>
                                    alterarFiltro("status", valor as FiltrosHome["status"])
                                }
                                opcoes={[
                                    ["todos", "Todos status"],
                                    ...Object.values(Enum.StatusProjeto).map(
                                        (valor) => [valor, labelStatusProjeto[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.provider}
                                placeholder="Provider"
                                onValueChange={(valor) =>
                                    alterarFiltro("provider", valor as FiltrosHome["provider"])
                                }
                                opcoes={[
                                    ["todos", "Todos providers"],
                                    ...Object.values(Enum.Provider).map(
                                        (valor) => [valor, labelProvider[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.tipoServico}
                                placeholder="Tipo"
                                onValueChange={(valor) =>
                                    alterarFiltro("tipoServico", valor as FiltrosHome["tipoServico"])
                                }
                                opcoes={[
                                    ["todos", "Todos tipos"],
                                    ...Object.values(Enum.TipoServico).map(
                                        (valor) => [valor, valor] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.tagRepositorio}
                                placeholder="Tag"
                                onValueChange={(valor) =>
                                    alterarFiltro(
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
                                {projetosFiltrados.length} de {totalProjetos} projetos
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
                                titulo="Nenhum projeto encontrado"
                                subtitulo="Ajuste os filtros para ampliar os resultados."
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
