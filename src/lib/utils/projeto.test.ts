import { describe, expect, it } from "vitest"

import { validarInformacoesProjeto } from "@/lib/utils/projeto"

describe("validarInformacoesProjeto", () => {
    it("valida nome e protocolos aceitos", () => {
        expect(validarInformacoesProjeto({ nome: "  ", urlAplicacao: "" }).nome).toBeDefined()
        expect(
            validarInformacoesProjeto({ nome: "Projeto", urlAplicacao: "ftp://exemplo.com" })
                .urlAplicacao
        ).toContain("http://")
        expect(
            validarInformacoesProjeto({ nome: "Projeto", urlAplicacao: "exemplo" }).urlAplicacao
        ).toBeDefined()
        expect(
            validarInformacoesProjeto({ nome: "Projeto", urlAplicacao: "https://exemplo.com" })
        ).toEqual({})
    })
})
