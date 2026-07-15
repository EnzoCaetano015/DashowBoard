import { AlertCircle } from "lucide-react"

import { Enum } from "@/backend/api/enums/enum"
import { GitHubIntegrationDialog } from "@/components/GitHubIntegrationDialog"
import { IntegrationCard } from "@/components/IntegrationCard"
import { SupabaseIntegrationDialog } from "@/components/SupabaseIntegrationDialog"
import { VercelIntegrationDialog } from "@/components/VercelIntegrationDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useIntegracoes } from "@/pages/Integracoes/Integracoes.hook"

export const IntegracoesPage = () => {
    const pagina = useIntegracoes()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Integrações</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Conecte contas e tokens para o DashwoBoard ler o estado dos seus recursos.
                </p>
            </div>
            {pagina.isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }, (_, indice) => (
                        <Skeleton
                            key={indice}
                            className="h-56 rounded-lg"
                        />
                    ))}
                </div>
            ) : pagina.isError ? (
                <Card className="border-destructive/40">
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="mx-auto size-8 text-destructive" />
                        <h2 className="mt-3 font-medium">Falha ao carregar integrações</h2>
                        <Button
                            className="mt-4"
                            onClick={() => void pagina.tentarNovamente()}
                        >
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {pagina.integracoes.map((integracao) => (
                        <IntegrationCard
                            key={integracao.provider}
                            integracao={integracao}
                            onTestar={() => pagina.abrirDialogo(integracao.provider)}
                            onConfigurar={() => pagina.abrirDialogo(integracao.provider)}
                        />
                    ))}
                </div>
            )}
            <GitHubIntegrationDialog
                open={pagina.dialogoAtivo === Enum.Provider.GitHub}
                onOpenChange={(open) =>
                    open ? pagina.abrirDialogo(Enum.Provider.GitHub) : pagina.fecharDialogo()
                }
            />
            <VercelIntegrationDialog
                open={pagina.dialogoAtivo === Enum.Provider.Vercel}
                onOpenChange={(open) =>
                    open ? pagina.abrirDialogo(Enum.Provider.Vercel) : pagina.fecharDialogo()
                }
            />
            <SupabaseIntegrationDialog
                open={pagina.dialogoAtivo === Enum.Provider.Supabase}
                onOpenChange={(open) =>
                    open ? pagina.abrirDialogo(Enum.Provider.Supabase) : pagina.fecharDialogo()
                }
            />
        </div>
    )
}
