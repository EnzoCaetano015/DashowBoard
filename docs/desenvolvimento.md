# Desenvolvimento

[← Voltar ao README](../README.md)

## Requisitos

- Node.js 24;
- pnpm 11;
- Rust estável;
- pré-requisitos do Tauri 2 para o sistema operacional.

## Instalação

```bash
git clone https://github.com/EnzoCaetano015/DashowBoard.git
cd DashowBoard
pnpm install
```

## Execução

Para trabalhar com todos os recursos do aplicativo:

```bash
pnpm tauri dev
```

Para desenvolvimento exclusivamente visual no navegador:

```bash
pnpm dev
```

O modo web não disponibiliza todas as APIs nativas. Integrações, SQLite, notificações e outros recursos do desktop devem ser validados no Tauri.

## Comandos

| Comando | Finalidade |
|---|---|
| `pnpm dev` | Inicia o frontend Vite. |
| `pnpm tauri dev` | Inicia o aplicativo desktop em desenvolvimento. |
| `pnpm test` | Executa os testes do frontend. |
| `pnpm build` | Valida o TypeScript e gera o build web. |
| `pnpm preview` | Visualiza o build web. |
| `pnpm tauri build` | Gera os artefatos nativos de instalação. |

Para validar o código Rust separadamente:

```bash
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

## Banco local

O banco `data.sqlite` é criado no diretório de configuração do aplicativo. As migrations são aplicadas durante a inicialização e não devem ser reescritas depois de publicadas.

O aplicativo permite revelar o arquivo local e exportar um backup para a pasta de downloads. SQL deve permanecer em `src/backend/sql`, usar parâmetros e retornar modelos tipados.

## Validação mínima

Antes de concluir uma mudança, execute:

```bash
pnpm test
pnpm build
```

Mudanças no runtime nativo também devem passar pelas verificações Rust. O projeto não possui script `lint` no momento.

