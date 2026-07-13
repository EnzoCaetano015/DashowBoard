import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export const DeleteProjectDialog = ({ nomeProjeto }: { nomeProjeto: string }) => (
    <AlertDialog>
        <AlertDialogTrigger
            render={
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                />
            }
        >
            <Trash2 />
            Excluir
        </AlertDialogTrigger>
        <AlertDialogContent className="border-border bg-card">
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
                <AlertDialogDescription>
                    Você vai remover o agrupamento local{" "}
                    <strong className="text-foreground">{nomeProjeto}</strong>.
                    <span className="mt-3 block rounded-md border border-warning/40 bg-warning/10 p-3 text-warning">
                        Isso <strong>não</strong> exclui repositórios no GitHub, projetos na Vercel,
                        serviços do Railway ou bases no Supabase. Somente o vínculo local no DashwoBoard
                        é removido.
                    </span>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => toast.success("Exclusão simulada. Nenhum dado foi removido.")}
                    className="bg-destructive text-white hover:bg-destructive/90"
                >
                    Excluir agrupamento
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)
