import type { InformacoesStepProps } from "@/components/NovoProjeto/NovoProjeto.types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const InformacoesStep = ({
    nome,
    descricao,
    urlAplicacao,
    erros,
    alterarNome,
    alterarDescricao,
    alterarUrl,
    validarCampo,
}: InformacoesStepProps) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-nome">Nome do projeto</Label>
            <Input
                id="novo-projeto-nome"
                value={nome}
                onChange={({ target }) => alterarNome(target.value)}
                onBlur={() => validarCampo("nome")}
                placeholder="ex.: Easy Rifas"
                aria-invalid={Boolean(erros.nome)}
                aria-describedby={erros.nome ? "novo-projeto-nome-erro" : undefined}
            />
            {erros.nome && (
                <p
                    id="novo-projeto-nome-erro"
                    className="text-xs text-destructive"
                >
                    {erros.nome}
                </p>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-descricao">Descrição curta</Label>
            <Textarea
                id="novo-projeto-descricao"
                value={descricao}
                onChange={({ target }) => alterarDescricao(target.value)}
                placeholder="Descreva o que é esse projeto…"
                rows={3}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-url">URL da aplicação (opcional)</Label>
            <Input
                id="novo-projeto-url"
                value={urlAplicacao}
                onChange={({ target }) => alterarUrl(target.value)}
                onBlur={() => validarCampo("urlAplicacao")}
                type="url"
                placeholder="https://app.exemplo.com"
                aria-invalid={Boolean(erros.urlAplicacao)}
                aria-describedby={erros.urlAplicacao ? "novo-projeto-url-erro" : undefined}
            />
            {erros.urlAplicacao && (
                <p
                    id="novo-projeto-url-erro"
                    className="text-xs text-destructive"
                >
                    {erros.urlAplicacao}
                </p>
            )}
        </div>
    </div>
)
