import { AlertTriangle, ArrowLeft, FolderX } from "lucide-react"
import { Link } from "react-router-dom"

import { ProjectHeader } from "@/components/ProjectHeader"
import { ProjectHistory } from "@/components/ProjectHistory"
import { ProjectOverview } from "@/components/ProjectOverview"
import { ProjectRepositories } from "@/components/ProjectRepositories"
import { ProjectServices } from "@/components/ProjectServices"
import { ProjectSettings } from "@/components/ProjectSettings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RetryProps } from "@/lib/types/common"
import { useDetalhesProjeto } from "@/pages/DetalhesProjeto/DetalhesProjeto.hook"

export const DetalhesProjetoPage = () => {
    const detalhes = useDetalhesProjeto()

    if (detalhes.isLoading) return <DetalhesSkeleton />
    if (detalhes.isError) return <EstadoErro onRetry={() => void detalhes.tentarNovamente()} />
    if (!detalhes.projeto) return <ProjetoNaoEncontrado />

    return (
        <div>
            <ProjectHeader
                projeto={detalhes.projeto}
                atualizando={detalhes.isFetching}
                onAtualizar={() => void detalhes.atualizar()}
            />
            <Tabs defaultValue="visao-geral">
                <div className="scrollbar-thin mb-4 overflow-x-auto border-b border-border">
                    <TabsList
                        variant="line"
                        className="min-w-max"
                    >
                        <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
                        <TabsTrigger value="servicos">Serviços</TabsTrigger>
                        <TabsTrigger value="repositorios">Repositórios</TabsTrigger>
                        <TabsTrigger value="historico">Histórico</TabsTrigger>
                        <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="visao-geral">
                    <ProjectOverview projeto={detalhes.projeto} />
                </TabsContent>
                <TabsContent value="servicos">
                    <ProjectServices servicos={detalhes.projeto.servicos} />
                </TabsContent>
                <TabsContent value="repositorios">
                    <ProjectRepositories repositorios={detalhes.projeto.repositorios} />
                </TabsContent>
                <TabsContent value="historico">
                    <ProjectHistory projeto={detalhes.projeto} />
                </TabsContent>
                <TabsContent value="configuracoes">
                    <ProjectSettings projeto={detalhes.projeto} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

const DetalhesSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-72 lg:col-span-2" />
            <Skeleton className="h-72" />
        </div>
    </div>
)
const EstadoErro = ({ onRetry }: RetryProps) => (
    <Card className="border-destructive/40">
        <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto size-8 text-destructive" />
            <h2 className="mt-3 font-medium">Falha ao carregar o projeto</h2>
            <Button
                className="mt-4"
                onClick={onRetry}
            >
                Tentar novamente
            </Button>
        </CardContent>
    </Card>
)
const ProjetoNaoEncontrado = () => (
    <Card className="border-dashed">
        <CardContent className="py-12 text-center">
            <FolderX className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Projeto não encontrado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                O agrupamento local que você buscou não existe mais.
            </p>
            <Button
                render={<Link to="/projetos" />}
                nativeButton={false}
                variant="outline"
                className="mt-4"
            >
                <ArrowLeft />
                Voltar para projetos
            </Button>
        </CardContent>
    </Card>
)
