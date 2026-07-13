export const formatarDuracao = (minutos: number) => {
    if (minutos < 60) {
        return `${minutos} min`
    }

    const horas = Math.floor(minutos / 60)
    const restante = minutos % 60
    return restante ? `${horas} h ${restante} min` : `${horas} h`
}

export const formatarAgora = (data = new Date()) => {
    const dia = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
    const hora = data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })

    return `${dia} · ${hora}`
}
