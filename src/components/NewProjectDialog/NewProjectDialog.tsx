import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { MonitoramentoStep } from "@/components/NewProjectDialog/steps/MonitoramentoStep"
import { InformacoesStep } from "@/components/NewProjectDialog/steps/InformacoesStep"
import { RelacionamentosStep } from "@/components/NewProjectDialog/steps/RelacionamentosStep"
import { RepositoriosStep } from "@/components/NewProjectDialog/steps/RepositoriosStep"
import { ServicosStep } from "@/components/NewProjectDialog/steps/ServicosStep"
import { useNewProjectDialog } from "@/components/NewProjectDialog/NewProjectDialog.hook"
import { etapasNovoProjeto } from "@/components/NewProjectDialog/NewProjectDialog.utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export const NewProjectDialog = () => {
    const dialog = useNewProjectDialog()

    return (
        <Dialog
            open={dialog.aberto}
            onOpenChange={dialog.alterarAberto}
        >
            <DialogTrigger render={<Button className="gap-2" />}>
                <Plus />
                Novo projeto
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-3xl">
                <DialogHeader className="border-b border-border p-5 pr-12">
                    <DialogTitle>Novo projeto</DialogTitle>
                    <DialogDescription>
                        Um projeto é um agrupador local. Ele não cria nada nas plataformas externas.
                    </DialogDescription>
                    <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
                        {etapasNovoProjeto.map((etapa, indice) => {
                            const concluida = dialog.etapa > etapa.id
                            const ativa = dialog.etapa === etapa.id
                            return (
                                <div
                                    key={etapa.id}
                                    className="flex min-w-max flex-1 items-center gap-2"
                                >
                                    <span
                                        className={cn(
                                            "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                                            concluida && "border-success bg-success/20 text-success",
                                            ativa && "border-primary bg-primary/20 text-primary",
                                            !concluida &&
                                                !ativa &&
                                                "border-border bg-surface-2 text-muted-foreground"
                                        )}
                                    >
                                        {concluida ? <Check className="size-3.5" /> : etapa.id}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-xs",
                                            ativa
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {etapa.titulo}
                                    </span>
                                    {indice < etapasNovoProjeto.length - 1 && (
                                        <span className="h-px min-w-4 flex-1 bg-border" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </DialogHeader>
                <div className="scrollbar-thin max-h-[52dvh] overflow-y-auto p-5">
                    {dialog.etapa === 1 && <InformacoesStep />}
                    {dialog.etapa === 2 && (
                        <RepositoriosStep
                            repositorios={dialog.repositorios}
                            selecionados={dialog.repositoriosSelecionados}
                            runtimeDisponivel={dialog.runtimeDisponivel}
                            quantidadeConexoes={dialog.quantidadeConexoes}
                            isLoading={dialog.repositoriosIsLoading}
                            isFetching={dialog.repositoriosIsFetching}
                            isError={dialog.repositoriosIsError}
                            erro={dialog.repositoriosErro}
                            falhas={dialog.repositoriosFalhas}
                            alternar={dialog.alternarRepositorio}
                            alterarTag={dialog.alterarTagRepositorio}
                            tentarNovamente={() => void dialog.tentarNovamenteRepositorios()}
                            atualizar={() => void dialog.atualizarRepositorios()}
                        />
                    )}
                    {dialog.etapa === 3 && (
                        <ServicosStep
                            selecionados={dialog.servicos}
                            alternar={dialog.alternarServico}
                        />
                    )}
                    {dialog.etapa === 4 && (
                        <RelacionamentosStep repositorios={dialog.repositoriosRelacionamento} />
                    )}
                    {dialog.etapa === 5 && <MonitoramentoStep />}
                </div>
                <DialogFooter className="m-0 flex-row items-center justify-between rounded-none border-t border-border bg-surface-1 p-4">
                    <Button
                        variant="ghost"
                        disabled={dialog.etapa === 1}
                        onClick={dialog.voltar}
                    >
                        <ChevronLeft />
                        Voltar
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Passo {dialog.etapa} de {etapasNovoProjeto.length}
                    </span>
                    {dialog.etapa < 5 ? (
                        <Button onClick={dialog.continuar}>
                            Continuar
                            <ChevronRight />
                        </Button>
                    ) : (
                        <Button
                            onClick={dialog.concluir}
                            className="bg-success text-success-foreground hover:bg-success/90"
                        >
                            <Check />
                            Criar projeto
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
