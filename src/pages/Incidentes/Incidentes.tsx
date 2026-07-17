import { AlertCircle, CheckCircle2, Clock, ExternalLink, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import { IncidentStatus } from "@/components/ProjectStatusDetails/ProjectStatusDetails"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import { cn } from "@/lib/utils"
import { formatarDataHora, formatarDuracao } from "@/lib/utils/date"
import { Resumo } from "@/pages/Incidentes/components/Resumo/Resumo"
import { useIncidentes } from "@/pages/Incidentes/Incidentes.hook"

export const IncidentesPage = () => {
    const {
        periodo,
        busca,
        incidentes,
        emAndamento,
        resolvidos,
        projetosMonitorados,
        runtimeDisponivel,
        isLoading,
        isError,
        atualizar,
        setPeriodo,
        setBusca,
    } = useIncidentes()

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Incidentes</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Todos os eventos detectados nos projetos monitorados.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={busca}
                            onChange={(evento) => setBusca(evento.target.value)}
                            placeholder="Buscar incidente…"
                            className="h-9 bg-surface-2 pl-8"
                        />
                    </div>
                    <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5">
                        {PERIODOS_MONITORAMENTO.map((periodoMonitoramento) => (
                            <Button
                                key={periodoMonitoramento}
                                size="xs"
                                variant="ghost"
                                onClick={() => setPeriodo(periodoMonitoramento)}
                                className={cn(
                                    periodo === periodoMonitoramento && "bg-primary/20 text-primary"
                                )}
                            >
                                {periodoMonitoramento} dias
                            </Button>
                        ))}
                    </div>
                </div>
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
                        <Card className="mt-6 overflow-hidden border-border py-0 shadow-none">
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
                                        {incidentes.map((incidente) => (
                                            <TableRow key={incidente.id}>
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
                                                    {incidente.servico}
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                        {projetosMonitorados} projetos com incidentes registrados · janela de {periodo}{" "}
                        dias.
                    </p>
                </>
            )}
        </div>
    )
}
