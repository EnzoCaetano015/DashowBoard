import { IntegrationCard } from "@/components/IntegrationCard/IntegrationCard"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { useIntegracoes } from "@/pages/Integracoes/Integracoes.hook"
import { GitHubIntegrationDialog } from "@/pages/Integracoes/modais/GitHubIntegrationDialog/GitHubIntegrationDialog"
import { RailwayIntegrationDialog } from "@/pages/Integracoes/modais/RailwayIntegrationDialog/RailwayIntegrationDialog"
import { SupabaseIntegrationDialog } from "@/pages/Integracoes/modais/SupabaseIntegrationDialog/SupabaseIntegrationDialog"
import { VercelIntegrationDialog } from "@/pages/Integracoes/modais/VercelIntegrationDialog/VercelIntegrationDialog"

export const IntegracoesPage = () => {
    const {
        modal,
        setModal,
        integracoes,
        isLoading,
        isError,
        error,
        atualizar,
        abrirDialogo,
        testarIntegracao,
        podeTestar,
        integracaoIsTesting,
    } = useIntegracoes()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Integrações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Conecte contas e tokens para o DashowBoard ler o estado dos seus recursos.
                </p>
            </div>
            {isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 4, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-56"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Falha ao carregar integrações"
                    subtitulo={error ?? "Não foi possível consultar as integrações configuradas."}
                    acao={<Button onClick={() => void atualizar()}>Tentar novamente</Button>}
                />
            ) : integracoes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {integracoes.map((integracao) => (
                        <IntegrationCard
                            key={integracao.provider}
                            integracao={integracao}
                            podeTestar={podeTestar(integracao.provider)}
                            isTesting={integracaoIsTesting(integracao.provider)}
                            onTestar={() => testarIntegracao(integracao.provider)}
                            onConfigurar={() => abrirDialogo(integracao.provider)}
                        />
                    ))}
                </div>
            ) : (
                <TemplateEstado.Vazio
                    titulo="Nenhuma integração disponível"
                    subtitulo="Configure uma integração para começar a consultar seus recursos."
                />
            )}
            <GitHubIntegrationDialog
                open={modal.integracaoGitHub}
                onClose={() => setModal("integracaoGitHub", { open: false })}
            />
            <VercelIntegrationDialog
                open={modal.integracaoVercel}
                onClose={() => setModal("integracaoVercel", { open: false })}
            />
            <SupabaseIntegrationDialog
                open={modal.integracaoSupabase}
                onClose={() => setModal("integracaoSupabase", { open: false })}
            />
            <RailwayIntegrationDialog
                open={modal.integracaoRailway}
                onClose={() => setModal("integracaoRailway", { open: false })}
            />
        </div>
    )
}
