import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const InformacoesStep = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-nome">Nome do projeto</Label>
            <Input
                id="novo-projeto-nome"
                placeholder="ex.: Easy Rifas"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-descricao">Descrição curta</Label>
            <Textarea
                id="novo-projeto-descricao"
                placeholder="Descreva o que é esse projeto…"
                rows={3}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="novo-projeto-url">URL da aplicação (opcional)</Label>
            <Input
                id="novo-projeto-url"
                type="url"
                placeholder="https://app.exemplo.com"
            />
        </div>
    </div>
)
