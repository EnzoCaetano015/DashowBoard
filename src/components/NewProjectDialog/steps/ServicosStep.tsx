import { AlertCircle, Clock, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { ServicosStepProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { ProviderIcon } from "@/components/ProviderIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

export const ServicosStep = ({
    projetos,
    selecionados,
    runtimeDisponivel,
    configurada,
    isLoading,
    isFetching,
    isError,
    erro,
    falhas,
    alternar,
    tentarNovamente,
    atualizar,
}: ServicosStepProps) => (
    <div className="space-y-5">
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium">Projetos Vercel</h3>
                    <p className="text-xs text-muted-foreground">
                        Selecione projetos pessoais ou dos times acessíveis ao token.
                    </p>
                </div>
                {runtimeDisponivel && configurada && !isLoading && !isError && (
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
                <EstadoVercel descricao="A integração Vercel está disponível no aplicativo desktop." />
            ) : !isLoading && !configurada ? (
                <EstadoVercel descricao="Conecte sua conta Vercel para listar os projetos." />
            ) : isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton key={index} className="h-24" />
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-destructive/40 p-8 text-center">
                    <AlertCircle className="mx-auto size-8 text-destructive" />
                    <h3 className="mt-3 font-medium">Falha ao consultar a Vercel</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{erro}</p>
                    <Button className="mt-4" variant="outline" onClick={tentarNovamente}>
                        Tentar novamente
                    </Button>
                </div>
            ) : projetos.length === 0 && falhas.length > 0 ? (
                <div className="rounded-lg border border-destructive/40 p-6 text-center">
                    <AlertCircle className="mx-auto size-7 text-destructive" />
                    <h3 className="mt-3 font-medium">Nenhum escopo pôde listar projetos</h3>
                    {falhas.map((falha) => (
                        <p key={`${falha.scopeId}-${falha.code}`} className="mt-1 text-xs text-muted-foreground">
                            <b>{falha.scopeName}:</b> {falha.message}
                        </p>
                    ))}
                </div>
            ) : projetos.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Nenhum projeto Vercel acessível foi encontrado.
                </div>
            ) : (
                <>
                    {falhas.length > 0 && (
                        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                            {falhas.map((falha) => (
                                <p key={`${falha.scopeId}-${falha.code}`}>
                                    <b>{falha.scopeName}:</b> {falha.message}
                                </p>
                            ))}
                        </div>
                    )}
                    {projetos.map((projeto) => {
                        const selecionado = selecionados.some(
                            (value) =>
                                value.externalProjectId === projeto.id &&
                                value.scopeId === projeto.escopo.id
                        )
                        return (
                            <label
                                key={`${projeto.escopo.id ?? "personal"}-${projeto.id}`}
                                className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface-2 p-3 hover:border-primary/50"
                            >
                                <Checkbox
                                    checked={selecionado}
                                    onCheckedChange={() => alternar(projeto)}
                                />
                                <ProviderIcon provider={Enum.Provider.Vercel} />
                                <span className="min-w-0 flex-1">
                                    <b className="block truncate text-sm font-medium">
                                        {projeto.nome}
                                    </b>
                                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                        <span>{projeto.escopo.nome}</span>
                                        <span>·</span>
                                        <span>{projeto.framework || "Framework não informado"}</span>
                                        <span>·</span>
                                        <span>{Enum.TipoServico.Frontend}</span>
                                    </span>
                                    <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                                        {projeto.productionUrl || "Sem deployment de produção"}
                                    </span>
                                </span>
                                {projeto.ultimoDeployment ? (
                                    <Badge variant="outline">
                                        {projeto.ultimoDeployment.estado === Enum.StatusDeployment.Sucesso
                                            ? "Sucesso"
                                            : projeto.ultimoDeployment.estado === Enum.StatusDeployment.Falha
                                              ? "Falha"
                                              : projeto.ultimoDeployment.estado ===
                                                  Enum.StatusDeployment.EmAndamento
                                                ? "Em andamento"
                                                : projeto.ultimoDeployment.estadoOriginal}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Sem deployment</Badge>
                                )}
                            </label>
                        )
                    })}
                </>
            )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
            {[Enum.Provider.Railway, Enum.Provider.Supabase].map((provider) => (
                <div
                    key={provider}
                    className="flex items-center gap-3 rounded-md border border-dashed border-border bg-surface-2 p-4 text-muted-foreground"
                >
                    <ProviderIcon provider={provider} />
                    <span className="flex-1 text-sm font-medium">
                        {provider === Enum.Provider.Railway ? "Railway" : "Supabase"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs">
                        <Clock className="size-3" /> Em breve
                    </span>
                </div>
            ))}
        </section>
    </div>
)

const EstadoVercel = ({ descricao }: { descricao: string }) => (
    <div className="rounded-lg border border-dashed p-8 text-center">
        <ProviderIcon provider={Enum.Provider.Vercel} className="mx-auto size-8" />
        <p className="mt-3 text-sm text-muted-foreground">{descricao}</p>
        <Button render={<Link to="/integracoes" />} nativeButton={false} className="mt-4">
            Ir para Integrações
        </Button>
    </div>
)
