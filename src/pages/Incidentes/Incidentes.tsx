import { AlertCircle, CheckCircle2, Clock, ExternalLink, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import { IncidentStatus } from "@/components/ProjectStatusDetails"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PERIODOS_MONITORAMENTO } from "@/lib/config/monitoring"
import { cn } from "@/lib/utils"
import { formatarDuracao } from "@/lib/utils/date"
import { useIncidentes } from "@/pages/Incidentes/Incidentes.hook"
import type { ResumoProps } from "@/pages/Incidentes/Incidentes.types"

export const IncidentesPage = () => {
    const pagina = useIncidentes()

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
                            value={pagina.busca}
                            onChange={(evento) => pagina.setBusca(evento.target.value)}
                            placeholder="Buscar incidente…"
                            className="h-9 bg-surface-2 pl-8"
                        />
                    </div>
                    <div className="inline-flex rounded-md border border-border bg-surface-2 p-0.5">
                        {PERIODOS_MONITORAMENTO.map((periodo) => (
                            <Button
                                key={periodo}
                                size="xs"
                                variant="ghost"
                                onClick={() => pagina.setPeriodo(periodo)}
                                className={cn(
                                    pagina.periodo === periodo && "bg-primary/20 text-primary"
                                )}
                            >
                                {periodo} dias
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            {pagina.isLoading ? (
                <Skeleton className="h-96 rounded-lg" />
            ) : pagina.isError ? (
                <Card className="border-destructive/40">
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="mx-auto size-8 text-destructive" />
                        <h2 className="mt-3 font-medium">Falha ao carregar incidentes</h2>
                        <Button
                            className="mt-4"
                            onClick={() => void pagina.tentarNovamente()}
                        >
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Resumo
                            titulo="Total"
                            valor={pagina.incidentes.length}
                            classe="text-info"
                        />
                        <Resumo
                            titulo="Em andamento"
                            valor={pagina.emAndamento}
                            classe="text-destructive"
                        />
                        <Resumo
                            titulo="Resolvidos"
                            valor={pagina.resolvidos}
                            classe="text-success"
                        />
                    </div>
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
                                    {pagina.incidentes.map((incidente) => (
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
                                                    {incidente.iniciadoEm}
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
                        {pagina.incidentes.length === 0 && (
                            <div className="p-10 text-center text-sm text-muted-foreground">
                                Nenhum incidente encontrado para esta busca.
                            </div>
                        )}
                    </Card>
                    <p className="mt-4 text-xs text-muted-foreground">
                        {pagina.projetosMonitorados} projetos com incidentes registrados · janela de{" "}
                        {pagina.periodo} dias.
                    </p>
                </>
            )}
        </div>
    )
}

const Resumo = ({ titulo, valor, classe }: ResumoProps) => (
    <Card className="border-border py-4 shadow-none">
        <CardContent className="px-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
            <div className={cn("mt-2 text-3xl font-semibold tabular-nums", classe)}>{valor}</div>
        </CardContent>
    </Card>
)
