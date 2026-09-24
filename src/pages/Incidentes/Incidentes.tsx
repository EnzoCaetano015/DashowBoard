import { AlertCircle, CheckCircle2, Clock, ExternalLink, RotateCcw, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import { FiltroSelect } from "@/components/FiltroSelect/FiltroSelect"
import { IncidentStatus } from "@/components/ProjectStatusDetails/ProjectStatusDetails"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import { cn } from "@/lib/utils"
import { formatarDataHora, formatarDuracao } from "@/lib/utils/date"
import { labelProvider } from "@/lib/utils/status"
import { Resumo } from "@/pages/Incidentes/components/Resumo/Resumo"
import { IncidentCard } from "@/pages/Incidentes/components/IncidentCard/IncidentCard"
import { useIncidentes } from "@/pages/Incidentes/Incidentes.hook"
import type { FiltrosIncidentes } from "@/pages/Incidentes/Incidentes.types"
import {
    LABEL_SEVERIDADE_INCIDENTE,
    LABEL_STATUS_INCIDENTE,
} from "@/pages/Incidentes/Incidentes.utils"

export const IncidentesPage = () => {
    const {
        filtros,
        incidentes,
        projetos,
        quantidadeFiltrosAtivos,
        emAndamento,
        resolvidos,
        projetosMonitorados,
        runtimeDisponivel,
        isLoading,
        isError,
        atualizar,
        alterarFiltro,
        limparFiltros,
    } = useIncidentes()

    return (
        <div>
            <div className="mb-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Incidentes</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Todos os eventos detectados nos projetos monitorados.
                    </p>
                </div>
            </div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
                <div className="relative min-w-52 flex-1 sm:max-w-72">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={filtros.busca}
                        onChange={(evento) => alterarFiltro("busca", evento.target.value)}
                        placeholder="Filtrar incidentes nesta página…"
                        aria-label="Filtrar incidentes nesta página"
                        className="h-9 bg-surface-2 pl-8"
                    />
                </div>
                <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5">
                    {PERIODOS_MONITORAMENTO.map((periodoMonitoramento) => (
                        <Button
                            key={periodoMonitoramento}
                            size="xs"
                            variant="ghost"
                            onClick={() => alterarFiltro("periodo", periodoMonitoramento)}
                            aria-pressed={filtros.periodo === periodoMonitoramento}
                            className={cn(
                                filtros.periodo === periodoMonitoramento &&
                                    "bg-primary/20 text-primary"
                            )}
                        >
                            {periodoMonitoramento} dias
                        </Button>
                    ))}
                </div>
                <FiltroSelect
                    value={filtros.status}
                    placeholder="Status"
                    ariaLabel="Filtrar incidentes por status"
                    onValueChange={(valor) =>
                        alterarFiltro("status", valor as FiltrosIncidentes["status"])
                    }
                    opcoes={[
                        ["todos", "Todos status"],
                        ...Object.values(Enum.StatusIncidente).map(
                            (valor) => [valor, LABEL_STATUS_INCIDENTE[valor]] as const
                        ),
                    ]}
                />
                <FiltroSelect
                    value={filtros.severidade}
                    placeholder="Severidade"
                    ariaLabel="Filtrar incidentes por severidade"
                    onValueChange={(valor) =>
                        alterarFiltro("severidade", valor as FiltrosIncidentes["severidade"])
                    }
                    opcoes={[
                        ["todos", "Todas severidades"],
                        ...Object.values(Enum.SeveridadeIncidente).map(
                            (valor) => [valor, LABEL_SEVERIDADE_INCIDENTE[valor]] as const
                        ),
                    ]}
                />
                <FiltroSelect
                    value={filtros.provider}
                    placeholder="Provider"
                    ariaLabel="Filtrar incidentes por provider"
                    onValueChange={(valor) =>
                        alterarFiltro("provider", valor as FiltrosIncidentes["provider"])
                    }
                    opcoes={[
                        ["todos", "Todos providers"],
                        ...Object.values(Enum.Provider).map(
                            (valor) => [valor, labelProvider[valor]] as const
                        ),
                    ]}
                />
                <FiltroSelect
                    value={filtros.projetoId}
                    placeholder="Projeto"
                    ariaLabel="Filtrar incidentes por projeto"
                    onValueChange={(valor) => alterarFiltro("projetoId", valor)}
                    opcoes={[
                        ["todos", "Todos projetos"],
                        ...projetos.map(({ id, nome }) => [id, nome] as const),
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
            </div>
            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    titulo="Incidentes disponíveis no aplicativo desktop"
                    subtitulo="O histórico real é persistido no SQLite pelo runtime nativo."
                    Icon={AlertCircle}
                />
            ) : isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 1, orientacao: "vertical" }}
                    className="**:data-[slot=skeleton]:h-96"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Falha ao carregar incidentes"
                    subtitulo="Não foi possível consultar o histórico local."
                    acao={<Button onClick={() => void atualizar()}>Tentar novamente</Button>}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Resumo
                            titulo="Total"
                            valor={incidentes.length}
                            classe="text-info"
                        />
                        <Resumo
                            titulo="Em andamento"
                            valor={emAndamento}
                            classe="text-destructive"
                        />
                        <Resumo
                            titulo="Resolvidos"
                            valor={resolvidos}
                            classe="text-success"
                        />
                    </div>
                    {incidentes.length === 0 ? (
                        <TemplateEstado.Vazio
                            titulo="Nenhum incidente detectado"
                            subtitulo="Não há incidentes reais nesta janela ou para a busca informada."
                            Icon={AlertCircle}
                            className="mt-6"
                        />
                    ) : (
                        <>
                            <div className="mt-6 space-y-3 md:hidden">
                                {incidentes.map((incidente) => (
                                    <IncidentCard
                                        key={incidente.id}
                                        incidente={incidente}
                                    />
                                ))}
                            </div>
                            <Card className="mt-6 hidden overflow-hidden border-border py-0 shadow-none md:block">
                            <div className="overflow-x-auto">
                                <Table className="min-w-5xl">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Incidente</TableHead>
                                            <TableHead>Projeto</TableHead>
                                            <TableHead>Serviço</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Início</TableHead>
                                            <TableHead className="text-right">Duração</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incidentes.map((incidente) => {
                                            const ativo =
                                                incidente.status !== Enum.StatusIncidente.Resolvido
                                            return (
                                                <TableRow
                                                    key={incidente.id}
                                                    className={cn(
                                                        ativo &&
                                                            "border-l-2 border-l-destructive bg-destructive/5"
                                                    )}
                                                >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {incidente.status ===
                                                        Enum.StatusIncidente.Resolvido ? (
                                                            <CheckCircle2 className="size-4 text-success" />
                                                        ) : (
                                                            <AlertCircle className="size-4 text-destructive" />
                                                        )}
                                                        <span className="font-medium">
                                                            {incidente.titulo}
                                                        </span>
                                                        {ativo && (
                                                            <span className="sr-only">
                                                                Incidente ativo
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/projetos/${incidente.projetoId}`}
                                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        {incidente.projetoNome}
                                                        <ExternalLink className="size-3" />
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span>{incidente.servico}</span>
                                                        {incidente.provider && (
                                                            <Badge
                                                                variant="outline"
                                                                className="gap-1"
                                                            >
                                                                <ProviderIcon
                                                                    provider={incidente.provider}
                                                                    className="size-3"
                                                                    decorativo
                                                                />
                                                                {labelProvider[incidente.provider]}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <IncidentStatus
                                                        status={incidente.status}
                                                        severidade={incidente.severidade}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="size-3" />
                                                        {formatarDataHora(incidente.iniciadoEm)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs tabular-nums">
                                                    {formatarDuracao(incidente.duracaoMinutos)}
                                                </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            </Card>
                        </>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                        {projetosMonitorados} projetos com incidentes registrados · janela de{" "}
                        {filtros.periodo} dias.
                    </p>
                </>
            )}
        </div>
    )
}
