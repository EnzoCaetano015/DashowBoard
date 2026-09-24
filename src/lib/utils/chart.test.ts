import { describe, expect, it } from "vitest"

import { resumirSerie } from "@/lib/utils/chart"

describe("resumirSerie", () => {
    it("trata série vazia, constante e completa", () => {
        expect(resumirSerie([])).toBeNull()
        expect(resumirSerie([5])).toEqual({
            minimo: 5,
            maximo: 5,
            media: 5,
            ultimo: 5,
            quantidade: 1,
        })
        expect(resumirSerie([10, 20, 30])).toEqual({
            minimo: 10,
            maximo: 30,
            media: 20,
            ultimo: 30,
            quantidade: 3,
        })
    })
})
