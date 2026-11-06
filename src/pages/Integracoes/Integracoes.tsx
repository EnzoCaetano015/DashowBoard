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
                <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Connect accounts and tokens so DashowBoard can read the status of your resources.
                </p>
            </div>
            {isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 4, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-56"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Unable to load integrations"
                    subtitulo={error ?? "Unable to query the configured integrations."}
                    acao={<Button onClick={() => void atualizar()}>Try again</Button>}
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
                    titulo="No integrations available"
                    subtitulo="Configure an integration to start monitoring your resources."
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
