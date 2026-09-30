# Publicação e contribuição

[← Voltar ao README](../README.md)

## Landing page

A landing page está em [`site/index.html`](../site/index.html) e pode ser aberta diretamente no navegador, sem instalação ou build.

O workflow [`pages.yml`](../.github/workflows/pages.yml) publica somente a pasta `site` no GitHub Pages quando ela, ou o próprio workflow, é alterada na branch `main`. A publicação também pode ser iniciada manualmente pela aba Actions.

Página publicada: <https://enzocaetano015.github.io/DashowBoard/>

## Integração contínua

O workflow [`ci.yml`](../.github/workflows/ci.yml) valida pull requests e alterações na `main` em ambiente Windows. Ele executa testes e build do frontend, formatação, verificação e testes do código Rust.

## Releases

O workflow [`release.yml`](../.github/workflows/release.yml) cria instaladores Windows e publica uma GitHub Release. A execução é manual, deve partir da `main`, exige uma CI bem-sucedida para o commit e recebe:

- uma versão no formato `vMAJOR.MINOR.PATCH`;
- uma mensagem introdutória para as notas da release.

Para gerar um instalador apenas localmente:

```bash
pnpm tauri build
```

## Como contribuir

1. faça um fork e clone o repositório;
2. crie uma branch de escopo pequeno;
3. instale as dependências e valide a mudança;
4. descreva claramente o comportamento alterado;
5. inclua imagens ou vídeos quando houver mudança visual;
6. abra um pull request.

Antes de contribuir, consulte o [`AGENTS.md`](../AGENTS.md), que documenta as regras de arquitetura e implementação do projeto.

### Ao adicionar um provider

- confirme o contrato oficial da API;
- modele requests e responses em `src/backend/api/models`;
- mantenha a fronteira da integração em `src/backend/api/integrations`;
- exponha consultas pelo controller do domínio;
- implemente o cliente nativo e o armazenamento seguro em `src-tauri` quando necessário;
- libere somente os endpoints exigidos nas capabilities;
- preserve falhas independentes e erros normalizados.

## Próximos passos

- ampliar a cobertura das integrações;
- evoluir a visualização de incidentes e disponibilidade;
- melhorar notificações locais;
- ampliar os testes automatizados;
- preparar instaladores para outras plataformas.

