import { Check, ChevronLeft, ChevronRight } from "lucide-react"

import { Modal } from "@/components/Modal"
import { useNovoProjetoConteudo } from "@/components/NovoProjeto/NovoProjetoConteudo.hook"
import type { NovoProjetoConteudoProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { etapasNovoProjeto } from "@/components/NovoProjeto/NovoProjeto.utils"
import { InformacoesStep } from "@/components/NovoProjeto/steps/InformacoesStep"
import { MonitoramentoStep } from "@/components/NovoProjeto/steps/MonitoramentoStep"
import { RelacionamentosStep } from "@/components/NovoProjeto/steps/RelacionamentosStep"
import { RepositoriosStep } from "@/components/NovoProjeto/steps/RepositoriosStep"
import { RevisaoStep } from "@/components/NovoProjeto/steps/RevisaoStep"
import { ServicosStep } from "@/components/NovoProjeto/steps/ServicosStep"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const NovoProjetoConteudo = ({ open, onClose }: NovoProjetoConteudoProps) => {
    const {
        etapa,
        maiorEtapaVisitada,
        formulario,
        errosInformacoes,
        confirmacaoDescarteAberta,
        repositorios,
        repositoriosRelacionamento,
        repositoriosIsLoading,
        repositoriosIsFetching,
        repositoriosFalhas,
        quantidadeConexoes,
        runtimeDisponivel,
        criarProjetoIsPending,
        vercel,
        supabase,
        railway,
        voltar,
        continuar,
        concluir,
        irParaEtapa,
        editarEtapa,
        validarCampo,
        solicitarFechamento,
        manterEditando,
        descartarAlteracoes,
        alterarFormulario,
        alternarRepositorio,
        alterarTagRepositorio,
        alterarRelacionamento,
        atualizarRepositorios,
    } = useNovoProjetoConteudo(open, onClose)

    return (
        <>
            <Modal.Content
                open={open}
                onClose={solicitarFechamento}
                disableClose={criarProjetoIsPending}
                className="min-w-0 max-h-[90dvh] gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-3xl"
            >
                <Modal.Header
                    titulo="Novo projeto"
                    subTitulo="Um projeto é um agrupador local. Ele não cria nada nas plataformas externas."
                    className="min-w-0 border-b border-border p-5 pr-12"
                >
                    <div className="scrollbar-thin mt-4 flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-1">
                        {etapasNovoProjeto.map((etapaConfig, indice) => {
                            const ativa = etapa === etapaConfig.id
                            const concluida = !ativa && etapaConfig.id < maiorEtapaVisitada
                            const disponivel = etapaConfig.id <= maiorEtapaVisitada
                            return (
                                <div
                                    key={etapaConfig.id}
                                    className="flex min-w-max flex-1 items-center gap-2"
                                >
                                    <button
                                        type="button"
                                        disabled={!disponivel || criarProjetoIsPending}
                                        onClick={() => irParaEtapa(etapaConfig.id)}
                                        aria-current={ativa ? "step" : undefined}
                                        className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
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
                                            {concluida ? <Check className="size-3.5" /> : etapaConfig.id}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs",
                                                ativa
                                                    ? "font-medium text-foreground"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {etapaConfig.titulo}
                                        </span>
                                    </button>
                                    {indice < etapasNovoProjeto.length - 1 && (
                                        <span className="h-px min-w-4 flex-1 bg-border" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Modal.Header>
                <Modal.Body className="scrollbar-thin min-w-0 max-h-[52dvh] overflow-y-auto p-5">
                    {etapa === 1 && (
                        <InformacoesStep
                            nome={formulario.nome}
                            descricao={formulario.descricao}
                            urlAplicacao={formulario.urlAplicacao}
                            erros={errosInformacoes}
                            alterarNome={(valor) => alterarFormulario("nome", valor)}
                            alterarDescricao={(valor) => alterarFormulario("descricao", valor)}
                            alterarUrl={(valor) => alterarFormulario("urlAplicacao", valor)}
                            validarCampo={validarCampo}
                        />
                    )}
                    {etapa === 2 && (
                        <RepositoriosStep
                            repositorios={repositorios}
                            selecionados={formulario.repositorios}
                            runtimeDisponivel={runtimeDisponivel}
                            quantidadeConexoes={quantidadeConexoes}
                            isLoading={repositoriosIsLoading}
                            isFetching={repositoriosIsFetching}
                            falhas={repositoriosFalhas}
                            alternar={alternarRepositorio}
                            alterarTag={alterarTagRepositorio}
                            atualizar={() => void atualizarRepositorios()}
                        />
                    )}
                    {etapa === 3 && (
                        <ServicosStep
                            selecionados={formulario.servicos}
                            vercel={vercel}
                            supabase={supabase}
                            railway={railway}
                        />
                    )}
                    {etapa === 4 && (
                        <RelacionamentosStep
                            repositorios={repositoriosRelacionamento}
                            servicos={formulario.servicos}
                            relacionamentos={formulario.relacionamentos}
                            alterarRelacionamento={alterarRelacionamento}
                        />
                    )}
                    {etapa === 5 && (
                        <MonitoramentoStep
                            intervaloVerificacao={formulario.intervaloVerificacao}
                            timeout={formulario.timeout}
                            notificacoes={formulario.notificacoes}
                            coletarDeployments={formulario.coletarDeployments}
                            alterarIntervalo={(valor) => alterarFormulario("intervaloVerificacao", valor)}
                            alterarTimeout={(valor) => alterarFormulario("timeout", valor)}
                            alterarNotificacoes={(valor) => alterarFormulario("notificacoes", valor)}
                            alterarColetaDeployments={(valor) =>
                                alterarFormulario("coletarDeployments", valor)
                            }
                        />
                    )}
                    {etapa === 6 && (
                        <RevisaoStep
                            formulario={formulario}
                            repositorios={repositoriosRelacionamento}
                            editarEtapa={editarEtapa}
                        />
                    )}
                </Modal.Body>
                <Modal.Actions className="m-0 min-w-0 flex-row items-center justify-between rounded-none border-t border-border bg-surface-1 p-4">
                    <Button
                        variant="ghost"
                        disabled={etapa === 1 || criarProjetoIsPending}
                        onClick={voltar}
                    >
                        <ChevronLeft />
                        Voltar
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Passo {etapa} de {etapasNovoProjeto.length}
                    </span>
                    {etapa < 6 ? (
                        <Button
                            onClick={continuar}
                            disabled={criarProjetoIsPending}
                        >
                            Continuar
                            <ChevronRight />
                        </Button>
                    ) : (
                        <Button
                            onClick={concluir}
                            disabled={criarProjetoIsPending}
                            className="bg-success text-success-foreground hover:bg-success/90"
                        >
                            <Check />
                            {criarProjetoIsPending ? "Criando..." : "Criar projeto"}
                        </Button>
                    )}
                </Modal.Actions>
            </Modal.Content>

            <AlertDialog
                open={confirmacaoDescarteAberta}
                onOpenChange={(aberta) => {
                    if (!aberta) manterEditando()
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Os dados preenchidos neste projeto serão perdidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={manterEditando}>
                            Continuar editando
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={descartarAlteracoes}
                        >
                            Descartar alterações
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
