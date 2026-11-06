import { ArrowLeft, FolderX } from "lucide-react"
import { Link } from "react-router-dom"

import { TemplateEstado } from "@/components/TemplateEstado"
import { Button } from "@/components/ui/button"

export const ProjetoNaoEncontrado = () => (
    <TemplateEstado.Vazio
        titulo="Project not found"
        subtitulo="The local group you requested no longer exists."
        Icon={FolderX}
        acao={
            <Button
                render={<Link to="/projetos" />}
                nativeButton={false}
                variant="outline"
            >
                <ArrowLeft />
                Back to projects
            </Button>
        }
    />
)
