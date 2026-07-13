import { AlertTriangle, FolderGit2 } from "lucide-react"

import { NewProjectDialog } from "@/components/NewProjectDialog"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjetos } from "@/pages/Projetos/Projetos.hook"

export const ProjetosPage = () => {
    const { projetos, isLoading, isError, tentarNovamente } = useProjetos()

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Todos os agrupamentos locais de repositórios e serviços.
                    </p>
                </div>
                <NewProjectDialog />
            </div>
            {isLoading && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }, (_, indice) => (
                        <Skeleton
                            key={indice}
                            className="h-56 rounded-lg"
                        />
                    ))}
                </div>
            )}
            {isError && (
                <Card className="border-destructive/40">
                    <CardContent className="py-12 text-center">
                        <AlertTriangle className="mx-auto size-8 text-destructive" />
                        <h2 className="mt-3 font-medium">Falha ao carregar projetos</h2>
                        <Button
                            className="mt-4"
                            onClick={() => void tentarNovamente()}
                        >
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            )}
            {!isLoading && !isError && projetos.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <FolderGit2 className="mx-auto size-8 text-muted-foreground" />
                        <h2 className="mt-3 font-medium">Nenhum projeto criado</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Crie seu primeiro agrupamento local para começar.
                        </p>
                    </CardContent>
                </Card>
            )}
            {!isLoading && !isError && projetos.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projetos.map((projeto) => (
                        <ProjectCard
                            key={projeto.id}
                            projeto={projeto}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
