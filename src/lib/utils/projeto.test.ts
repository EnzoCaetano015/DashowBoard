import { describe, expect, it } from "vitest"

import { validarInformacoesProjeto } from "@/lib/utils/projeto"

describe("validarInformacoesProjeto", () => {
    it("valida nome e protocolos aceitos", () => {
        expect(validarInformacoesProjeto({ nome: "  ", urlAplicacao: "" }).nome).toBeDefined()
        expect(
            validarInformacoesProjeto({ nome: "Project", urlAplicacao: "ftp://exemplo.com" })
                .urlAplicacao
        ).toContain("http://")
        expect(
            validarInformacoesProjeto({ nome: "Project", urlAplicacao: "example" }).urlAplicacao
        ).toBeDefined()
        expect(
            validarInformacoesProjeto({ nome: "Project", urlAplicacao: "https://exemplo.com" })
        ).toEqual({})
    })
})
