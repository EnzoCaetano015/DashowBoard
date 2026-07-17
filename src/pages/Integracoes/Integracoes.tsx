import { IntegrationCard } from "@/components/IntegrationCard/IntegrationCard"
import { TemplateEstado } from "@/components/TemplateEstado"
import { useIntegracoes } from "@/pages/Integracoes/Integracoes.hook"
import { GitHubIntegrationDialog } from "@/pages/Integracoes/modais/GitHubIntegrationDialog/GitHubIntegrationDialog"
import { RailwayIntegrationDialog } from "@/pages/Integracoes/modais/RailwayIntegrationDialog/RailwayIntegrationDialog"
import { SupabaseIntegrationDialog } from "@/pages/Integracoes/modais/SupabaseIntegrationDialog/SupabaseIntegrationDialog"
import { VercelIntegrationDialog } from "@/pages/Integracoes/modais/VercelIntegrationDialog/VercelIntegrationDialog"

export const IntegracoesPage = () => {
    const { modal, setModal, integracoes, abrirDialogo } = useIntegracoes()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Integrações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Conecte contas e tokens para o DashowBoard ler o estado dos seus recursos.
                </p>
            </div>
            {integracoes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {integracoes.map((integracao) => (
                        <IntegrationCard
                            key={integracao.provider}
                            integracao={integracao}
                            onTestar={() => abrirDialogo(integracao.provider)}
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
