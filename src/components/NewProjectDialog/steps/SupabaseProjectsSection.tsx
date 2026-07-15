import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

import { Enum } from "@/backend/api/enums/enum"
import type { SupabaseProjectsSectionProps } from "@/components/NewProjectDialog/NewProjectDialog.types"
import { ProviderIcon } from "@/components/ProviderIcon"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { abrirUrlExterna } from "@/lib/utils/tauri"

export const SupabaseProjectsSection = ({
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
}: SupabaseProjectsSectionProps) => (
    <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
            <div>
                <h3 className="text-sm font-medium">Projetos Supabase</h3>
                <p className="text-xs text-muted-foreground">
                    Selecione bancos acessíveis ao Personal Access Token.
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
            <EstadoSupabase descricao="A integração Supabase está disponível no aplicativo desktop." />
        ) : !isLoading && !configurada ? (
            <EstadoSupabase descricao="Conecte sua conta Supabase para listar os projetos." />
        ) : isLoading ? (
            <div className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton
                        key={index}
                        className="h-32"
                    />
                ))}
            </div>
        ) : isError ? (
            <div className="rounded-lg border border-destructive/40 p-8 text-center">
                <AlertCircle className="mx-auto size-8 text-destructive" />
                <h3 className="mt-3 font-medium">Falha ao consultar o Supabase</h3>
                <p className="mt-1 text-sm text-muted-foreground">{erro}</p>
                <Button
                    className="mt-4"
                    variant="outline"
                    onClick={tentarNovamente}
                >
                    Tentar novamente
                </Button>
            </div>
        ) : projetos.length === 0 && falhas.length > 0 ? (
            <FalhasSupabase
                falhas={falhas}
                completa
            />
        ) : projetos.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Nenhum projeto Supabase acessível foi encontrado.
            </div>
        ) : (
            <>
                {falhas.length > 0 && <FalhasSupabase falhas={falhas} />}
                {projetos.map((projeto) => {
                    const selecionado = selecionados.some(
                        (value) =>
                            value.provider === Enum.Provider.Supabase &&
                            value.externalProjectId === projeto.ref &&
                            value.scopeId === projeto.organizacaoSlug
                    )
                    const inativo = projeto.statusOriginal === "INACTIVE"
                    return (
                        <div
                            key={projeto.ref}
                            className="flex items-start gap-3 rounded-md border border-border bg-surface-2 p-3 hover:border-primary/50"
                        >
                            <Checkbox
                                checked={selecionado}
                                onCheckedChange={() => alternar(projeto)}
                                aria-label={`Selecionar ${projeto.nome}`}
                            />
                            <ProviderIcon provider={Enum.Provider.Supabase} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <b className="truncate text-sm font-medium">{projeto.nome}</b>
                                    <StatusBadge status={projeto.status} />
                                    <Badge variant={inativo ? "destructive" : "outline"}>
                                        {inativo
                                            ? "Pausado"
                                            : projeto.statusOriginal === "ACTIVE_HEALTHY"
                                              ? "Ativo"
                                              : projeto.statusOriginal || "Desconhecido"}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {projeto.organizacaoNome} ·{" "}
                                    {projeto.regiao || "Região não informada"}
                                    {" · "}
                                    {projeto.cloudProvider || "Cloud não informada"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Banco: {projeto.banco?.statusOriginal || "Não informado"} · Compute:{" "}
                                    {projeto.banco?.computeSize || "Não informado"}
                                </p>
                            </div>
                            {inativo && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void abrirUrlExterna(projeto.dashboardUrl)}
                                >
                                    Abrir no Supabase <ExternalLink />
                                </Button>
                            )}
                        </div>
                    )
                })}
            </>
        )}
    </section>
)

const FalhasSupabase = ({
    falhas,
    completa = false,
}: Pick<SupabaseProjectsSectionProps, "falhas"> & { completa?: boolean }) => (
    <div
        className={
            completa
                ? "rounded-lg border border-destructive/40 p-6 text-center"
                : "rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning"
        }
    >
        {completa && <AlertCircle className="mx-auto mb-3 size-7 text-destructive" />}
        {falhas.map((falha) => (
            <p
                key={`${falha.organizacaoId}-${falha.code}`}
                className="text-xs"
            >
                <b>{falha.organizacaoNome}:</b> {falha.message}
            </p>
        ))}
    </div>
)

const EstadoSupabase = ({ descricao }: { descricao: string }) => (
    <div className="rounded-lg border border-dashed p-8 text-center">
        <ProviderIcon
            provider={Enum.Provider.Supabase}
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
