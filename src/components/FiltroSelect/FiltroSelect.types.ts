export type FiltroSelectProps = {
    value: string
    placeholder: string
    ariaLabel: string
    onValueChange: (valor: string) => void
    opcoes: ReadonlyArray<readonly [string, string]>
    className?: string
}
