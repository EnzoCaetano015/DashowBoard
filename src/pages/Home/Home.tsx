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
                    <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Estado agregado dos seus projetos e serviços monitorados.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                    skeleton={{ quantidade: 5, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-36 **:data-[slot=template-estado-skeletons]:grid-cols-2 **:data-[slot=template-estado-skeletons]:md:grid-cols-3 **:data-[slot=template-estado-skeletons]:xl:grid-cols-5"
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
                                "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5",
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
                                valor={metricas.online}
                                icone={<CheckCircle2 />}
                                destaque="success"
                                tendencia={metricas.tendencias.online}
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
                                titulo="Serviços monitorados"
                                valor={metricas.servicosMonitorados}
                                icone={<Server />}
                                destaque="info"
                                tendencia={metricas.tendencias.servicos}
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
                                    placeholder="Filtrar projetos nesta página…"
                                    aria-label="Filtrar projetos nesta página"
                                    className="h-9 bg-surface-2 pl-8"
                                />
                            </div>
                            <FiltroSelect
                                value={filtros.status}
                                placeholder="Status"
                                ariaLabel="Filtrar por status do projeto"
                                onValueChange={(valor) =>
                                    alterarFiltro("status", valor as FiltrosHome["status"])
                                }
                                opcoes={[
                                    ["todos", "Todos status"],
                                    ...STATUS_PROJETO_FILTROS.map(
                                        (valor) => [valor, labelStatusProjeto[valor]] as const
                                    ),
                                ]}
                            />
                            <FiltroSelect
                                value={filtros.provider}
                                placeholder="Provider"
                                ariaLabel="Filtrar por provider"
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
                                ariaLabel="Filtrar por tipo de serviço"
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
                                ariaLabel="Filtrar por tag de repositório"
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
                            <FiltroSelect
                                value={filtros.ordenacao}
                                placeholder="Ordenar"
                                ariaLabel="Ordenar projetos"
                                onValueChange={(valor) =>
                                    alterarFiltro("ordenacao", valor as FiltrosHome["ordenacao"])
                                }
                                opcoes={[
                                    ["criticidade", "Mais críticos"],
                                    ["nome", "Nome A–Z"],
                                    ["verificacao", "Verificação recente"],
                                    ["incidentes", "Mais incidentes ativos"],
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
                                    Limpar filtros ({quantidadeFiltrosAtivos})
                                </Button>
                            )}
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
