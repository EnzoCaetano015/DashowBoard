import { Boxes, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { RailwayProjectsSectionProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { ProviderIcon } from "@/components/ProviderIcon/ProviderIcon"
import { StatusBadge } from "@/components/StatusBadge/StatusBadge"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatarDataHora } from "@/lib/utils/date"

export const RailwayProjectsSection = ({
    projetos,
    selecionados,
    runtimeDisponivel,
    configurada,
    isLoading,
    isFetching,
    falhas,
    alternar,
    alterarTipo,
    alterarCriticidade,
    atualizar,
}: RailwayProjectsSectionProps) => (
    <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
            <div>
                <h3 className="text-sm font-medium">Serviços Railway</h3>
                <p className="text-xs text-muted-foreground">
                    Escolha o tipo para incluir um serviço. O DashwoBoard não o deduz automaticamente.
                </p>
            </div>
            {runtimeDisponivel && configurada && !isLoading && (
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isFetching}
                    onClick={atualizar}
                >
                    <RefreshCw className={isFetching ? "animate-spin" : undefined} /> Atualizar
                </Button>
            )}
        </div>

        {!runtimeDisponivel ? (
            <EstadoRailway descricao="A integração Railway está disponível no aplicativo desktop." />
        ) : !isLoading && !configurada ? (
            <EstadoRailway descricao="Conecte sua conta Railway para listar projetos e serviços." />
        ) : isLoading ? (
            <TemplateEstado.Carregando
                skeleton={{ quantidade: 3, orientacao: "vertical" }}
                className="**:data-[slot=skeleton]:h-40"
            />
        ) : projetos.length === 0 ? (
            <TemplateEstado.Vazio
                titulo="Nenhum projeto Railway encontrado"
                subtitulo="Nenhum projeto pessoal ou de workspace foi retornado pela conta."
                Icon={Boxes}
            />
        ) : (
            <>
                {falhas.length > 0 && (
                    <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                        {falhas.map((falha) => (
                            <p key={`${falha.workspaceId}-${falha.projectId}-${falha.code}`}>
                                <b>{falha.workspaceName}:</b> {falha.message}
                            </p>
                        ))}
                    </div>
                )}
                {projetos.map((projeto) => (
                    <div
                        key={`${projeto.workspaceId ?? "personal"}-${projeto.id}`}
                        className="overflow-hidden rounded-md border border-border"
                    >
                        <div className="flex flex-wrap items-center gap-2 bg-surface-2 px-3 py-2">
                            <ProviderIcon provider={Enum.Provider.Railway} />
                            <span className="text-xs text-muted-foreground">
                                {projeto.workspaceNome}
                            </span>
                            <span className="text-xs text-muted-foreground">/</span>
                            <b className="text-sm font-medium">{projeto.nome}</b>
                            <StatusBadge status={projeto.status} />
                        </div>
                        {projeto.ambientes.map((ambiente) => (
                            <div
                                key={ambiente.id}
                                className="border-t border-border p-3"
                            >
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Ambiente · {ambiente.nome}
                                </p>
                                <div className="space-y-2">
                                    {ambiente.servicos.map((servico) => {
                                        const selecionado = selecionados.find(
                                            (item) =>
                                                item.provider === Enum.Provider.Railway &&
                                                item.externalProjectId === projeto.id &&
                                                item.externalEnvironmentId === ambiente.id &&
                                                item.externalServiceId === servico.id
                                        )
                                        return (
                                            <div
                                                key={servico.id}
                                                className="grid gap-3 rounded-md bg-surface-2 p-3 lg:grid-cols-[minmax(0,1fr)_11rem_auto] lg:items-center"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Checkbox
                                                            checked={Boolean(selecionado)}
                                                            disabled={!selecionado}
                                                            onCheckedChange={() =>
                                                                selecionado &&
                                                                alternar(
                                                                    projeto,
                                                                    servico,
                                                                    selecionado.tipo
                                                                )
                                                            }
                                                            aria-label={`Remover ${servico.nome}`}
                                                        />
                                                        <b className="truncate text-sm font-medium">
                                                            {servico.nome}
                                                        </b>
                                                        <StatusBadge status={servico.status} />
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Deployment:{" "}
                                                        {servico.deploymentStatusOriginal ??
                                                            "Não disponível"}
                                                        {servico.deploymentCriadoEm
                                                            ? ` · ${formatarDataHora(servico.deploymentCriadoEm)}`
                                                            : ""}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Região: {servico.regiao ?? "Não informada"} ·
                                                        Réplicas: {servico.replicas ?? "Não informado"}
                                                    </p>
                                                </div>
                                                <Select
                                                    value={selecionado?.tipo ?? ""}
                                                    onValueChange={(tipo) => {
                                                        if (!tipo) return
                                                        const tipoServico = tipo as Enum.TipoServico
                                                        if (selecionado) {
                                                            alterarTipo(selecionado, tipoServico)
                                                        } else {
                                                            alternar(projeto, servico, tipoServico)
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full bg-surface-3">
                                                        <SelectValue placeholder="Selecionar tipo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(Enum.TipoServico).map((tipo) => (
                                                            <SelectItem
                                                                key={tipo}
                                                                value={tipo}
                                                            >
                                                                {tipo}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {selecionado ? (
                                                    <label className="flex items-center gap-2 text-xs">
                                                        <Checkbox
                                                            checked={selecionado.critico}
                                                            onCheckedChange={(valor) =>
                                                                alterarCriticidade(
                                                                    selecionado,
                                                                    valor === true
                                                                )
                                                            }
                                                        />
                                                        Crítico
                                                    </label>
                                                ) : (
                                                    <Badge variant="outline">Escolha o tipo</Badge>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </>
        )}
    </section>
)

const EstadoRailway = ({ descricao }: { descricao: string }) => (
    <div className="rounded-lg border border-dashed p-8 text-center">
        <ProviderIcon
            provider={Enum.Provider.Railway}
            className="mx-auto size-8"
        />
        <p className="mt-3 text-sm text-muted-foreground">{descricao}</p>
        <Button
            render={<Link to="/integracoes" />}
            nativeButton={false}
            className="mt-4"
        >
            Ir para Integrações
        </Button>
    </div>
)
