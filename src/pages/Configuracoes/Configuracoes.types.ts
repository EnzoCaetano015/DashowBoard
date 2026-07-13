import type { ReactNode } from "react"

export type Preferencias = {
    iniciarComSistema: boolean
    segundoPlano: boolean
    notificacoes: boolean
    som: boolean
    badge: boolean
    intervalo: string
    tema: string
    densidade: string
    nome: string
}

export type SecaoProps = {
    titulo: string
    descricao: string
    children: ReactNode
}

export type CampoProps = {
    titulo: string
    controleId: string
    children: ReactNode
}

export type ItemProps = {
    titulo: string
    valor: string
}
