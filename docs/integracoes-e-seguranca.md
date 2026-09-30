# Integrações e segurança

[← Voltar ao README](../README.md)

O DashowBoard integra GitHub, Vercel, Railway e Supabase. Cada provider possui contratos, consultas e tratamento de erros independentes.

## Responsabilidades por provider

### GitHub

Representa a origem do código: repositórios, branches, commits, linguagens, issues, pull requests e workflows.

### Vercel

Representa projetos e deployments de aplicações. Um deployment concluído não substitui um health check de disponibilidade.

### Railway

Um projeto pode conter vários ambientes e serviços. O status é calculado a partir dos serviços monitorados, sem reduzir o provider a um único valor booleano.

### Supabase

Representa projeto, API e banco de dados. Estado administrativo, disponibilidade da API e disponibilidade do banco são informações distintas.

## Credenciais

Tokens são segredos locais e devem seguir estas regras:

- nunca usar variáveis `VITE_*` para credenciais;
- nunca salvar tokens no código-fonte, logs ou arquivos versionados;
- nunca exibir o token completo na interface;
- solicitar apenas os escopos necessários;
- enviar cada token somente ao provider correspondente;
- armazenar credenciais pela camada nativa segura do sistema operacional.

O frontend solicita as operações por comandos Tauri. Os clientes Rust acessam os providers e as credenciais são protegidas pelo keyring nativo quando suportado.

## Permissões de rede

As capabilities do Tauri permitem somente os endpoints necessários:

- `api.github.com`;
- `api.vercel.com`;
- `backboard.railway.com`;
- `api.supabase.com`.

Novos domínios exigem uma alteração explícita e restrita em `src-tauri/capabilities/default.json`.

## Erros

Uma integração deve diferenciar indisponibilidade, credencial inválida, limite de requisições, timeout, ausência de configuração e erro desconhecido. Uma falha nunca deve ser convertida silenciosamente em uma lista vazia.

Ao combinar providers, a falha de um deles não deve cancelar os resultados válidos dos demais.

