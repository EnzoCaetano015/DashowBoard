import { ProjectHeader } from "@/components/ProjectHeader/ProjectHeader"
import { ProjectHistory } from "@/components/ProjectHistory/ProjectHistory"
import { ProjectOverview } from "@/components/ProjectOverview/ProjectOverview"
import { ProjectRepositories } from "@/components/ProjectRepositories/ProjectRepositories"
import { ProjectServices } from "@/components/ProjectServices/ProjectServices"
import { ProjectSettings } from "@/components/ProjectSettings/ProjectSettings"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjetoNaoEncontrado } from "@/pages/DetalhesProjeto/components/ProjetoNaoEncontrado/ProjetoNaoEncontrado"
import { useDetalhesProjeto } from "@/pages/DetalhesProjeto/DetalhesProjeto.hook"
import { DeleteProjectDialog } from "@/pages/DetalhesProjeto/modais/DeleteProjectDialog/DeleteProjectDialog"

export const DetalhesProjetoPage = () => {
    const { modal, setModal, projeto, runtimeDisponivel, isLoading, isFetching, isError, atualizar } =
        useDetalhesProjeto()

    if (!runtimeDisponivel)
        return (
            <TemplateEstado.Vazio
                titulo="Detalhes disponíveis no aplicativo desktop"
                subtitulo="Projetos locais e snapshots reais dependem do SQLite e do runtime nativo."
            />
        )
    if (isLoading)
        return (
            <TemplateEstado.Carregando
                skeleton={{ quantidade: 4, orientacao: "vertical" }}
                className="**:data-[slot=skeleton]:h-32"
            />
        )
    if (isError)
        return (
            <TemplateEstado.Erro
                titulo="Falha ao carregar o projeto"
                subtitulo="Não foi possível consultar o agrupamento no banco local."
                acao={<Button onClick={() => void atualizar()}>Tentar novamente</Button>}
            />
        )
    if (!projeto) return <ProjetoNaoEncontrado />

    return (
        <div>
            <ProjectHeader
                projeto={projeto}
                atualizando={isFetching}
                onAtualizar={() => void atualizar()}
                onExcluir={() => setModal("excluirProjeto", { open: true })}
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
                    <ProjectOverview projeto={projeto} />
                </TabsContent>
                <TabsContent value="servicos">
                    <ProjectServices
                        servicos={projeto.servicos}
                        onAtualizar={() => void atualizar()}
                    />
                </TabsContent>
                <TabsContent value="repositorios">
                    <ProjectRepositories repositorios={projeto.repositorios} />
                </TabsContent>
                <TabsContent value="historico">
                    <ProjectHistory projeto={projeto} />
                </TabsContent>
                <TabsContent value="configuracoes">
                    <ProjectSettings projeto={projeto} />
                </TabsContent>
            </Tabs>
            <DeleteProjectDialog
                open={modal.excluirProjeto}
                onClose={() => setModal("excluirProjeto", { open: false })}
                projetoId={projeto.id}
                nomeProjeto={projeto.nome}
            />
        </div>
    )
}
