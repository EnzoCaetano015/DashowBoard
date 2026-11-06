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
import { EditProjectDialog } from "@/pages/DetalhesProjeto/modais/EditProjectDialog/EditProjectDialog"

export const DetalhesProjetoPage = () => {
    const {
        modal,
        setModal,
        projeto,
        aba,
        runtimeDisponivel,
        isLoading,
        isFetching,
        isError,
        atualizar,
        atualizarServico,
        servicoAtualizando,
        alterarAba,
    } = useDetalhesProjeto()

    if (!runtimeDisponivel)
        return (
            <TemplateEstado.Vazio
                titulo="Details are available in the desktop app"
                subtitulo="Local projects and live snapshots require SQLite and the native runtime."
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
                titulo="Unable to load the project"
                subtitulo="Unable to load the group from the local database."
                acao={<Button onClick={() => void atualizar()}>Try again</Button>}
            />
        )
    if (!projeto) return <ProjetoNaoEncontrado />

    return (
        <div>
            <ProjectHeader
                projeto={projeto}
                atualizando={isFetching}
                onAtualizar={() => void atualizar()}
                onEditar={() => setModal("editarProjeto", { open: true })}
                onExcluir={() => setModal("excluirProjeto", { open: true })}
            />
            <Tabs
                value={aba}
                onValueChange={alterarAba}
            >
                <div className="scrollbar-thin mb-4 overflow-x-auto border-b border-border">
                    <TabsList
                        variant="line"
                        className="min-w-max"
                    >
                        <TabsTrigger value="visao-geral">Overview</TabsTrigger>
                        <TabsTrigger value="servicos">Services</TabsTrigger>
                        <TabsTrigger value="repositorios">Repositories</TabsTrigger>
                        <TabsTrigger value="historico">History</TabsTrigger>
                        <TabsTrigger value="configuracoes">Settings</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="visao-geral">
                    <ProjectOverview projeto={projeto} />
                </TabsContent>
                <TabsContent value="servicos">
                    <ProjectServices
                        servicos={projeto.servicos}
                        onAtualizar={atualizarServico}
                        servicoAtualizando={servicoAtualizando}
                    />
                </TabsContent>
                <TabsContent value="repositorios">
                    <ProjectRepositories repositorios={projeto.repositorios} />
                </TabsContent>
                <TabsContent value="historico">
                    <ProjectHistory projeto={projeto} />
                </TabsContent>
                <TabsContent value="configuracoes">
                    <ProjectSettings
                        projeto={projeto}
                        onEditar={() => setModal("editarProjeto", { open: true })}
                    />
                </TabsContent>
            </Tabs>
            <EditProjectDialog
                key={modal.editarProjeto ? `editar-${projeto.id}` : `editar-fechado-${projeto.id}`}
                open={modal.editarProjeto}
                onClose={() => setModal("editarProjeto", { open: false })}
                projeto={projeto}
            />
            <DeleteProjectDialog
                open={modal.excluirProjeto}
                onClose={() => setModal("excluirProjeto", { open: false })}
                projetoId={projeto.id}
                nomeProjeto={projeto.nome}
            />
        </div>
    )
}
