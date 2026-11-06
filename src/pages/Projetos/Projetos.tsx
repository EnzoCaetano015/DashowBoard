import { FolderGit2, Plus } from "lucide-react"

import { ProjectCard } from "@/components/ProjectCard/ProjectCard"
import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"
import { useProjetos } from "@/pages/Projetos/Projetos.hook"
import { NovoProjeto } from "@/pages/Projetos/modais/NovoProjeto/NovoProjeto"

export const ProjetosPage = () => {
    const { modal, setModal, projetos, runtimeDisponivel, isLoading, isError, atualizar } = useProjetos()

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        All your local groups of repositories and services.
                    </p>
                </div>
                <Button
                    onClick={() => setModal("novoProjeto", { open: true })}
                    disabled={!runtimeDisponivel}
                >
                    <Plus />
                    New project
                </Button>
            </div>
            {!runtimeDisponivel ? (
                <TemplateEstado.Vazio
                    titulo="Local projects are available in the desktop app"
                    subtitulo="SQLite and native integrations are not accessed during browser development."
                    Icon={FolderGit2}
                />
            ) : isLoading ? (
                <TemplateEstado.Carregando
                    skeleton={{ quantidade: 6, orientacao: "horizontal" }}
                    className="**:data-[slot=skeleton]:h-56"
                />
            ) : isError ? (
                <TemplateEstado.Erro
                    titulo="Unable to load projects"
                    subtitulo="Unable to load groups from the local database."
                    acao={<Button onClick={() => void atualizar()}>Try again</Button>}
                />
            ) : projetos.length === 0 ? (
                <TemplateEstado.Vazio
                    titulo="No projects yet"
                    subtitulo="Create your first local group to get started."
                    Icon={FolderGit2}
                    acao={
                        <Button onClick={() => setModal("novoProjeto", { open: true })}>
                            <Plus />
                            New project
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projetos.map((projeto) => (
                        <ProjectCard
                            key={projeto.id}
                            projeto={projeto}
                        />
                    ))}
                </div>
            )}
            <NovoProjeto
                open={modal.novoProjeto}
                onClose={() => setModal("novoProjeto", { open: false })}
            />
        </div>
    )
}
