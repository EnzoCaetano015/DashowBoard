## 1. Objetivo deste arquivo

Este arquivo define o padrão obrigatório para qualquer agente de código que trabalhe neste repositório.

Todo código novo deve parecer que já fazia parte do projeto. Antes de alterar qualquer arquivo, o agente deve inspecionar a estrutura existente, o `package.json`, os arquivos próximos da feature e os padrões já usados.

Não invente outra arquitetura, não mova arquivos sem necessidade e não faça refatorações fora do escopo solicitado.

---

## 2. Contexto do projeto

O DashwoBoard é um aplicativo desktop pessoal para centralizar a visibilidade de projetos distribuídos entre:

- GitHub;
- Vercel;
- Railway;
- Supabase.

O aplicativo agrupa informações de código, deployments, serviços, bancos de dados, disponibilidade e incidentes em um único lugar.

O aplicativo não administra nem exclui recursos remotamente nesta fase. Ele consulta dados, organiza vínculos locais, persiste configurações e histórico no SQLite e exibe o estado atual dos serviços.

Stack principal:

- React;
- TypeScript;
- Vite;
- Tauri 2;
- TanStack Query;
- React Router;
- Tailwind CSS;
- shadcn/ui;
- Lucide React;
- SQLite por meio do plugin SQL do Tauri;
- HTTP por meio do plugin HTTP do Tauri.

O aplicativo não possui login próprio. Tokens de integração são configurações locais e nunca devem ser inseridos diretamente no bundle do frontend.

---

## 3. Regras principais

1. Siga a arquitetura atual sem criar camadas paralelas.
2. Não adicione bibliotecas sem necessidade real e sem autorização explícita.
3. Não coloque chamadas de API, SQL ou Tauri diretamente em páginas e componentes visuais.
4. Não use `any`.
5. Não use strings soltas para query keys, providers, tipos ou status conhecidos.
6. Não crie arquivos `.styles.ts`, `.styled.ts`, CSS Modules ou styled-components.
7. Use Tailwind CSS e os tokens do tema para estilização.
8. Use componentes shadcn/ui antes de criar um componente base do zero.
9. Não exponha tokens em variáveis `VITE_*`, código-fonte, logs ou commits.
10. Não exclua, altere ou publique recursos remotos sem solicitação explícita.
11. Não confunda projeto local, repositório GitHub e serviço de infraestrutura.
12. Faça a menor mudança capaz de resolver a tarefa.
13. Não faça refatoração oportunista de arquivos não relacionados.
14. Preserve a compatibilidade com o aplicativo Tauri empacotado.
15. Quando houver dúvida de contrato de uma API externa, não invente campos: valide o contrato antes de implementar.

---

## 4. Modelo de domínio obrigatório

O domínio deve manter estas entidades separadas:

### Projeto

Agrupador local criado pelo usuário no DashwoBoard.

Um projeto pode conter:

- zero ou mais repositórios;
- zero ou mais serviços;
- integrações com diferentes providers;
- configurações de monitoramento;
- histórico local de status e incidentes.

Excluir um projeto remove somente o agrupamento e seus vínculos locais. Nunca deve excluir recursos no GitHub, Vercel, Railway ou Supabase.

### Repositório

Representa código hospedado no GitHub.

Papéis permitidos inicialmente:

- Frontend;
- API;
- Worker;
- Biblioteca;
- Infraestrutura;
- Documentação.

Um repositório pode estar relacionado a vários serviços. Remover um repositório de um projeto significa apenas remover a associação local.

### Serviço

Representa um recurso executado ou hospedado em um provider.

Tipos permitidos inicialmente:

- Frontend;
- API;
- Worker;
- Banco de dados;
- Cache;
- Fila;
- Cron job.

Um serviço pode existir sem repositório relacionado. Bancos do Supabase e serviços de banco do Railway não devem ser forçados a possuir repositório.

### Integração

Representa o vínculo local entre uma entidade do DashwoBoard e um recurso externo.

Exemplos:

- projeto local para projeto Vercel;
- projeto local para projeto Railway;
- serviço local para serviço Railway;
- projeto local para projeto Supabase;
- repositório local para repositório GitHub.

### Status

Status agregados permitidos:

- Saudável;
- Degradado;
- Offline;
- Atualizando;
- Desconhecido.

Não reduzir todo o sistema a `online` e `offline`.

Regra geral de agregação:

- todos os serviços críticos disponíveis: `Saudável`;
- pelo menos um serviço crítico indisponível: `Degradado`;
- todos os serviços críticos indisponíveis: `Offline`;
- consulta sem resposta confiável ou autenticação inválida: `Desconhecido`;
- deployment ou sincronização em andamento: `Atualizando`.

### Incidente

Um incidente é uma mudança relevante de estado, e não cada consulta com erro.

Exemplos:

- online para offline;
- offline para online;
- deployment concluído para deployment com erro;
- projeto Supabase ativo para pausado;
- autenticação válida para token inválido.

Não registrar repetidamente o mesmo incidente enquanto o recurso permanecer no mesmo estado.

---

## 5. Estrutura obrigatória

A estrutura canônica do frontend é:

```txt
src/
  api/
    controllers/
    enums/
      enum.ts
    integrations/
    models/

  assets/

  components/
    ui/
    NomeDoComponente/
      NomeDoComponente.tsx
      NomeDoComponente.types.ts
      NomeDoComponente.utils.ts
      index.ts

  lib/
    config/
    hooks/
    types/
    utils/

  pages/
    NomeDaPagina/
      NomeDaPagina.tsx
      NomeDaPagina.hook.ts
      NomeDaPagina.schema.ts
      NomeDaPagina.types.ts
      NomeDaPagina.utils.ts
      index.ts

  routes/
    routes.tsx

  sql/
    database.ts
    migrations.ts
    models/
    repositories/

  main.tsx
```

Nem toda pasta ou feature precisa de todos os arquivos. Crie somente o necessário.

Não criar pastas alternativas como:

```txt
services/
providers/
data/
repositories/
store/
styles/
```

fora das camadas já definidas, salvo alteração arquitetural explicitamente aprovada.

---

## 6. Responsabilidade de cada camada

### `src/api/controllers`

Contém hooks do TanStack Query.

Responsabilidades:

- declarar `useQuery` e `useMutation`;
- definir query keys;
- definir intervalos de refetch;
- controlar `enabled`, retry e cache;
- chamar funções de `src/api/integrations`;
- expor dados tipados para hooks de página e componentes;
- invalidar queries após alterações locais relevantes.

Não deve:

- montar JSX;
- acessar SQLite diretamente;
- usar toast;
- navegar entre páginas;
- conter detalhes de HTTP de cada provider;
- conter regra visual.

### `src/api/integrations`

Contém clientes e funções puras de integração com APIs externas.

Um arquivo por provider ou domínio:

```txt
src/api/integrations/github.ts
src/api/integrations/vercel.ts
src/api/integrations/railway.ts
src/api/integrations/supabase.ts
```

Responsabilidades:

- montar URLs, headers e payloads;
- executar a chamada pelo cliente HTTP configurado;
- interpretar o contrato bruto do provider;
- normalizar erros;
- mapear a resposta externa para modelos internos quando aplicável.

Não deve:

- exportar hooks React;
- importar TanStack Query;
- importar componentes;
- usar toast;
- navegar;
- acessar SQLite;
- armazenar estado global;
- fazer polling por conta própria.

Funções devem usar verbos claros:

```ts
obterRepositoriosGitHub
obterProjetoVercel
obterServicosRailway
obterStatusSupabase
```

### `src/api/models`

Contém contratos de request, response e modelos normalizados das integrações.

Agrupe operações em namespaces:

```ts
export namespace ObterRepositoriosGitHub {
    export type Request = {
        owner: string
    }

    export type Response = RepositorioGitHub[]
}
```

Quando necessário, separe o contrato bruto do provider do modelo normalizado:

```ts
export namespace ObterServicosRailway {
    export type ApiResponse = {
        // contrato externo
    }

    export type Response = Servico[]
}
```

Não espalhar tipos de API dentro de páginas, componentes ou controllers.

### `src/api/enums/enum.ts`

Todos os enums conhecidos do projeto ficam em um único arquivo e dentro do namespace `Enum`.

Exemplo:

```ts
export namespace Enum {
    export enum Provider {
        GitHub = "github",
        Vercel = "vercel",
        Railway = "railway",
        Supabase = "supabase",
    }

    export enum StatusProjeto {
        Saudavel = "saudavel",
        Degradado = "degradado",
        Offline = "offline",
        Atualizando = "atualizando",
        Desconhecido = "desconhecido",
    }

    export enum QueryKey {
        Projetos = "projetos",
        RepositoriosGitHub = "repositorios_github",
        ProjetoVercel = "projeto_vercel",
        ProjetoRailway = "projeto_railway",
        ProjetoSupabase = "projeto_supabase",
    }
}
```

Regras:

- não criar outro arquivo de enum;
- não declarar enum dentro de componente;
- não usar string solta quando o valor pertencer a um conjunto conhecido;
- query keys devem partir de `Enum.QueryKey`.

### `src/sql`

Contém tudo que acessa ou define o SQLite.

Responsabilidades:

- inicialização da conexão;
- migrations;
- criação de tabelas e índices;
- repositories;
- mapeamento entre linhas SQL e modelos locais;
- transações;
- persistência de projetos, vínculos, configurações, snapshots e incidentes.

Nenhum SQL pode existir fora de `src/sql`.

Padrão sugerido:

```txt
src/sql/
  database.ts
  migrations.ts
  models/
    projeto.ts
    servico.ts
    incidente.ts
  repositories/
    projeto.repository.ts
    servico.repository.ts
    incidente.repository.ts
```

Regras obrigatórias:

- usar queries parametrizadas;
- não concatenar entrada do usuário em SQL;
- migrations devem ser incrementais e nunca reescritas depois de publicadas;
- datas persistidas em ISO 8601 e UTC;
- mapear `0 | 1` do SQLite para `boolean` na borda do repository;
- usar transação quando uma operação alterar múltiplas tabelas;
- não expor instância de banco diretamente para páginas ou componentes;
- repositories devem retornar tipos de domínio, não linhas sem tipagem;
- não usar SQLite como cache temporário do TanStack Query;
- usar SQLite para persistência local, histórico e configuração.

### `src/lib/config`

Contém configuração centralizada de bibliotecas e infraestrutura frontend.

Exemplos:

```txt
query-client.ts
http-client.ts
monitoring.ts
sonner.ts
```

Regras:

- uma única instância de `QueryClient`;
- um único ponto de configuração HTTP;
- intervalos de polling devem ficar centralizados;
- não criar cliente dentro de componente;
- não duplicar configuração em cada integração.

### `src/lib/hooks`

Contém hooks reutilizáveis e independentes de uma página específica.

Exemplos:

- controle de debounce;
- detecção de conectividade;
- sincronização global de status;
- persistência de mudança de status;
- controle de janela ou ciclo de vida do Tauri.

Não colocar hook específico de uma única página nesta pasta.

### `src/lib/types`

Contém tipos utilitários compartilhados e que não pertencem a uma API específica.

Exemplos:

```ts
Nullable<T>
Optional<T>
SelectOption<T>
```

Tipos de request e response externos ficam em `src/api/models`.

Tipos exclusivos de SQL ficam em `src/sql/models`.

Tipos exclusivos de componente ficam ao lado do componente.

### `src/lib/utils`

Contém funções puras e helpers globais.

Exemplos:

- `cn` para combinar classes Tailwind;
- formatação de datas;
- formatação de duração;
- normalização de status;
- comparação de estados;
- cálculo de status agregado.

Helpers não devem depender de React.

### `src/pages`

Cada página deve possuir sua própria pasta em PascalCase.

Exemplo:

```txt
src/pages/DetalhesProjeto/
  DetalhesProjeto.tsx
  DetalhesProjeto.hook.ts
  DetalhesProjeto.types.ts
  DetalhesProjeto.utils.ts
  index.ts
```

Responsabilidades da página:

- montar a tela;
- consumir o hook da página;
- compor componentes globais e componentes shadcn/ui;
- renderizar estados de loading, erro, vazio e sucesso.

A página não deve:

- chamar integração diretamente;
- executar SQL;
- montar query do TanStack Query;
- conter regra de negócio pesada no JSX;
- conter grandes blocos de transformação de dados.

Toda lógica específica da página deve ficar em `NomeDaPagina.hook.ts` ou `NomeDaPagina.utils.ts`.

### `src/components`

Contém componentes reutilizáveis em mais de uma página.

Componentes customizados globais usam uma pasta própria:

```txt
components/ProjetoCard/
  ProjetoCard.tsx
  ProjetoCard.types.ts
  ProjetoCard.utils.ts
  index.ts
```

Nem todo componente precisa de `.types.ts` ou `.utils.ts`. Crie apenas quando necessário.

Não criar arquivos de estilo.

### `src/components/ui`

Contém exclusivamente componentes gerados ou adaptados do shadcn/ui.

Regras:

- manter a convenção de arquivos do shadcn, normalmente em kebab-case;
- não mover componentes shadcn para pastas PascalCase;
- não colocar regra de domínio dentro de componentes de `ui`;
- não editar um componente shadcn para atender apenas uma página específica;
- criar um componente customizado em `src/components` quando houver abstração de domínio;
- usar `cn` para composição de classes;
- preservar acessibilidade e props do componente original.

---

## 7. TanStack Query

### Configuração global

A única instância de `QueryClient` deve ficar em:

```txt
src/lib/config/query-client.ts
```

Não criar `QueryClient` em páginas, hooks ou componentes.

### Queries

Use `useQuery` para operações de leitura remota.

Padrão:

```ts
export const useObterRepositoriosGitHub = (owner: string) => {
    return useQuery({
        queryKey: [Enum.QueryKey.RepositoriosGitHub, owner],
        queryFn: () => obterRepositoriosGitHub({ owner }),
        enabled: Boolean(owner),
        staleTime: TEMPO_CACHE_METADADOS,
        refetchInterval: INTERVALO_METADADOS,
        refetchOnReconnect: true,
    })
}
```

Regras:

- query key sempre deve incluir parâmetros que mudam o resultado;
- use `enabled` quando IDs ou tokens ainda não estiverem disponíveis;
- não use `queryKey` com string literal;
- `queryFn` deve retornar dados e não manipular interface;
- `queryFn` não deve disparar toast;
- não apagar cache para atualizar dados;
- para atualização manual, use `refetch` ou `invalidateQueries`;
- polling deve usar `refetchInterval`;
- não implementar polling com `setInterval` dentro de componente;
- intervalos devem vir de `src/lib/config/monitoring.ts`;
- queries de status crítico podem ter frequência diferente de queries de métricas;
- GitHub, Vercel, Railway e Supabase devem possuir queries independentes;
- uma falha de provider não deve impedir a renderização dos demais providers.

### Mutations

Use `useMutation` para alterações locais ou ações remotas explicitamente aprovadas.

Exemplos locais:

- criar projeto no SQLite;
- editar projeto local;
- associar repositório;
- associar serviço;
- excluir agrupamento local.

Após mutation, invalide somente as queries afetadas.

### Polling e estado em segundo plano

O TanStack Query é responsável pela atualização periódica da interface enquanto o frontend estiver ativo.

Não trate o cache como histórico permanente.

Quando o status recebido mudar, um hook global pode:

1. comparar o novo status com o último status persistido;
2. registrar snapshot ou incidente no SQLite;
3. emitir notificação apenas em mudança relevante.

Não registrar efeitos colaterais diretamente dentro da função pura de integração.

### Atualização manual

Todo projeto deve poder ser atualizado manualmente.

Use:

```ts
await queryClient.invalidateQueries({
    queryKey: [Enum.QueryKey.Projetos, projectId],
})
```

ou o `refetch` da query correspondente.

Não use `window.location.reload()`.

---

## 8. Integrações externas

### Cliente HTTP

As integrações devem usar o cliente HTTP do Tauri encapsulado em:

```txt
src/lib/config/http-client.ts
```

Não usar diretamente:

```ts
window.fetch
axios
```

em páginas ou componentes.

Se o projeto optar por `@tauri-apps/plugin-http`, o import deve ficar na camada de configuração ou integração, nunca espalhado pela aplicação.

### GitHub

GitHub representa a origem do código.

Dados esperados:

- repositório;
- descrição;
- branch principal;
- último commit;
- linguagens;
- issues;
- pull requests;
- status de workflows.

Não usar o GitHub como representação obrigatória de banco ou serviço sem repositório.

### Vercel

Vercel representa principalmente frontend e deployment.

Separar:

- status do último deployment;
- URL e domínio;
- branch e commit publicados;
- métricas disponíveis;
- health check HTTP do frontend, quando configurado.

`READY` não deve ser convertido automaticamente em aplicação saudável sem considerar o health check configurado.

### Railway

Um projeto Railway pode possuir vários ambientes e vários serviços.

Nunca representar o Railway como um único booleano.

Modelar individualmente:

- projeto;
- ambiente;
- serviço;
- deployment;
- domínio;
- tipo do serviço;
- estado do serviço.

O status agregado do projeto Railway deve ser calculado a partir dos serviços monitorados.

### Supabase

Supabase representa projeto, API e banco.

Separar quando disponível:

- estado administrativo do projeto;
- projeto ativo ou pausado;
- disponibilidade da API;
- disponibilidade do banco;
- região;
- métricas disponíveis.

Não considerar erro de autenticação como banco offline. Use `Desconhecido` ou um estado específico de integração inválida.

### Erros de integração

Normalize erros em um tipo comum.

Exemplo:

```ts
export type IntegrationError = {
    provider: Enum.Provider
    statusCode?: number
    code?: string
    message: string
    cause?: unknown
}
```

Nunca ocultar erro com `catch { return [] }`.

Uma lista vazia e uma falha de integração não são a mesma coisa.

---

## 9. Tauri

### Regra geral

React é responsável pela interface. Tauri é responsável pelo ambiente desktop e pelos plugins nativos.

Não escrever Rust personalizado sem necessidade comprovada e sem solicitação explícita.

### Plugins

Acesso a plugins deve ser encapsulado.

Exemplos:

```txt
src/lib/config/http-client.ts
src/sql/database.ts
src/lib/hooks/useDesktopNotification.ts
```

Não importar plugins do Tauri diretamente em componentes de apresentação.

### Capabilities

Ao adicionar uma integração:

- liberar somente os domínios necessários;
- não usar permissões globais amplas;
- não liberar `https://**`;
- documentar qualquer alteração em `src-tauri/capabilities`.

### Execução no navegador

`pnpm dev` executa apenas o frontend e pode não disponibilizar APIs nativas do Tauri.

Quando uma feature depender de plugin nativo:

- prever mock ou estado informativo para desenvolvimento visual no navegador;
- não quebrar a renderização inicial por ausência do runtime Tauri;
- testar a funcionalidade real com `pnpm tauri dev`.

Não criar um backend HTTP local apenas para contornar essa diferença.

### `src-tauri`

Não alterar arquivos Rust, capabilities, plugins ou configuração do bundle fora do escopo da tarefa.

Quando alterar:

- manter permissões mínimas;
- não inserir segredos;
- não executar ações remotas destrutivas;
- registrar no resumo final quais arquivos nativos foram alterados.

---

## 10. React Router

As rotas devem ficar exclusivamente em:

```txt
src/routes/routes.tsx
```

Use React Router para navegação interna.

Para o aplicativo desktop empacotado, prefira `createHashRouter` para evitar dependência de fallback de servidor em rotas internas.

Padrão:

```tsx
const router = createHashRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
        ],
    },
])
```

Regras:

- não declarar rotas dentro de `App.tsx`;
- layouts devem usar `Outlet`;
- navegação programática fica em hook da página;
- links simples devem usar `Link` ou `NavLink`;
- manter uma rota de erro e uma rota `*`;
- não usar `window.location.href` para navegação interna;
- links para providers externos podem abrir no navegador do sistema por meio da integração adequada do Tauri.

---

## 11. Páginas e hooks de página

Padrão:

```tsx
export const ProjetosPage = () => {
    const {
        projetos,
        isLoading,
        isError,
        atualizarTudo,
    } = useProjetos()

    return (
        // JSX
    )
}
```

O hook de página concentra:

- queries e mutations usadas pela tela;
- filtros;
- estado local relevante;
- navegação;
- handlers;
- transformação específica da tela;
- integração com toast;
- composição de loading e erro.

Não colocar lógica complexa acima do `return` da página.

Quando a transformação for pura e reutilizável, mover para `.utils.ts`.

---

## 12. Componentes e shadcn/ui

### Prioridade de reutilização

Ao implementar interface:

1. verificar se existe componente em `src/components/ui`;
2. verificar se existe componente customizado global em `src/components`;
3. compor componentes existentes;
4. criar novo componente apenas se houver reutilização ou responsabilidade clara.

### Componentes customizados

Componentes de domínio devem receber dados e callbacks por props.

Exemplo:

```tsx
<ProjectCard
    project={project}
    onOpen={handleOpenProject}
    onRefresh={handleRefreshProject}
/>
```

Não devem buscar dados diretamente se forem componentes de apresentação.

### shadcn/ui

Use os componentes shadcn sem duplicar primitivas.

Exemplos:

- `Button`;
- `Card`;
- `Badge`;
- `Dialog`;
- `DropdownMenu`;
- `Tabs`;
- `Table`;
- `Tooltip`;
- `Skeleton`;
- `Alert`;
- `ScrollArea`;
- `Sheet`;
- `Sonner`.

Não criar `MeuButton`, `BaseCard` ou `CustomDialog` apenas para trocar classes simples.

Crie abstração de domínio quando o componente representar comportamento real, como:

- `ProjectCard`;
- `ProviderStatus`;
- `ServiceStatusCard`;
- `IncidentTimeline`;
- `MetricCard`.

---

## 13. Tailwind CSS

Toda estilização de componentes e páginas deve usar Tailwind.

Regras:

- usar `className`;
- usar `cn` para classes condicionais;
- usar variantes do shadcn/CVA quando houver múltiplas variantes estáveis;
- usar CSS variables para tokens de tema;
- evitar valores arbitrários quando existir token equivalente;
- não usar cores hexadecimais diretamente no JSX;
- não criar arquivo de estilo por componente;
- não usar `style={{ ... }}` salvo para valor realmente dinâmico sem equivalente em classe;
- não duplicar longas listas de classes em vários arquivos;
- preservar responsividade para diferentes tamanhos de janela desktop;
- garantir estados `hover`, `focus-visible`, `disabled`, loading e erro;
- respeitar contraste e acessibilidade.

CSS global deve conter somente:

- importação do Tailwind;
- tokens globais;
- reset/base necessários;
- estilos globais justificados.

Não colocar estilos específicos de página no CSS global.

---

## 14. Formulários

Quando houver formulários, use React Hook Form e Zod se essas dependências estiverem instaladas ou tiverem sido aprovadas.

Schemas ficam ao lado da página:

```txt
NomeDaPagina.schema.ts
```

Regras:

- validação não fica no JSX;
- mensagens devem ser objetivas;
- validação cruzada usa `superRefine`;
- inputs reutilizáveis devem integrar corretamente com o formulário;
- desabilitar ações enquanto a mutation estiver pendente;
- não usar estado separado para cada campo quando React Hook Form resolver.

---

## 15. Feedback, loading e erros

Use Sonner para feedback de ações.

Não usar:

- `alert`;
- `confirm` do navegador;
- logs como feedback ao usuário.

Toda tela que depende de dados deve tratar:

- carregamento inicial;
- atualização em segundo plano;
- erro;
- vazio;
- sucesso;
- dados parciais quando apenas um provider falhar.

Não bloquear todo o projeto porque uma única integração falhou.

Em agregações, prefira `Promise.allSettled` quando a falha de um provider não deve cancelar os demais.

Mensagens de erro devem diferenciar:

- indisponibilidade do recurso;
- token inválido;
- limite de requisições;
- timeout;
- ausência de configuração;
- erro desconhecido.

---

## 16. Tokens e segurança

Mesmo sendo um aplicativo pessoal e sem login, tokens são segredos.

Regras obrigatórias:

- não declarar token em variável `VITE_*`;
- não inserir token em código-fonte;
- não salvar token em arquivo versionado;
- não exibir token completo na interface;
- não registrar token em log;
- não incluir token em mensagens de erro;
- não enviar token para provider diferente;
- solicitar somente os escopos mínimos necessários;
- manter `.env*` sensível no `.gitignore` quando usado apenas em desenvolvimento;
- preferir armazenamento local seguro quando essa camada for implementada.

A ausência de login próprio não elimina a necessidade de proteger tokens externos.

---

## 17. Nomenclatura

### Arquivos e componentes

PascalCase para páginas e componentes customizados:

```txt
Home.tsx
ProjectCard.tsx
ProviderStatus.tsx
```

Hooks:

```txt
Home.hook.ts
useDebounce.ts
```

Schemas:

```txt
NovoProjeto.schema.ts
```

Types:

```txt
ProjectCard.types.ts
```

Controllers e integrations por domínio/provider:

```txt
github.ts
vercel.ts
railway.ts
supabase.ts
projeto.ts
```

Repositories:

```txt
projeto.repository.ts
servico.repository.ts
incidente.repository.ts
```

### Código

Usar nomes claros em português para o domínio do produto:

```ts
obterProjetos
atualizarProjeto
servicosOffline
ultimaVerificacao
incidentesDetectados
```

Nomes oficiais de bibliotecas, providers e propriedades externas podem permanecer em inglês quando isso evitar mapeamento artificial.

Não abreviar sem necessidade.

---

## 18. TypeScript e formatação

Padrão obrigatório:

- TypeScript estrito;
- indentação de 4 espaços;
- sem ponto e vírgula em arquivos novos;
- imports no topo;
- componentes funcionais;
- props tipadas;
- `import type` para imports somente de tipo;
- evitar default export, salvo padrão já adotado pelo arquivo ou integração de framework;
- evitar `any`;
- usar `unknown` e fazer narrowing;
- evitar type assertion sem necessidade;
- evitar non-null assertion `!` quando houver alternativa segura;
- evitar comentários óbvios;
- remover código morto;
- não deixar `console.log` em código final;
- preferir early return;
- preferir funções pequenas e nomes claros.

Imports devem seguir o alias configurado pelo projeto, normalmente `@/`.

Não criar novo padrão de alias sem necessidade.

---

## 19. Regras de implementação por feature

### Nova página

1. criar pasta em `src/pages/NomeDaPagina`;
2. criar `NomeDaPagina.tsx`;
3. criar `NomeDaPagina.hook.ts` se houver lógica;
4. criar `.schema.ts`, `.types.ts` ou `.utils.ts` apenas quando necessário;
5. exportar por `index.ts`;
6. adicionar rota em `src/routes/routes.tsx`;
7. reutilizar componentes shadcn e componentes globais.

### Nova consulta externa

1. confirmar o contrato da API;
2. criar ou atualizar model em `src/api/models`;
3. adicionar enums necessários em `src/api/enums/enum.ts`;
4. criar função pura em `src/api/integrations`;
5. criar hook TanStack Query em `src/api/controllers`;
6. definir query key com todos os parâmetros relevantes;
7. configurar cache e polling em constantes centrais;
8. tratar erro normalizado;
9. consumir somente por hook de página ou hook global.

### Nova persistência local

1. criar migration incremental;
2. criar ou atualizar model SQL;
3. criar repository;
4. usar queries parametrizadas;
5. adicionar transação quando necessário;
6. não executar SQL na página;
7. testar criação, leitura, atualização e exclusão local.

### Novo componente shadcn

1. adicionar pelo CLI do shadcn quando aplicável;
2. manter em `src/components/ui`;
3. não inserir regra de domínio;
4. preservar acessibilidade;
5. não copiar manualmente uma implementação diferente sem justificativa.

### Novo componente de domínio

1. criar pasta PascalCase em `src/components`;
2. usar componentes `ui` internamente;
3. receber dados e eventos por props;
4. não acessar API ou SQL diretamente;
5. criar `.types.ts` e `.utils.ts` somente quando necessário;
6. exportar por `index.ts`.

---

## 20. O que evitar

Nunca fazer sem aprovação explícita:

- criar Redux, Zustand ou outro estado global;
- criar backend Next.js ou servidor Node local;
- criar API HTTP interna;
- adicionar Axios se o projeto já usa o plugin HTTP do Tauri;
- usar `fetch` direto em página;
- executar SQL em componente;
- criar arquivo `.styles.ts`;
- criar CSS Module;
- adicionar Material UI, Chakra, Ant Design ou outra biblioteca visual;
- duplicar componente do shadcn;
- hardcode de tokens;
- guardar tokens em `localStorage` ou `sessionStorage`;
- misturar resposta bruta de provider diretamente no JSX;
- tratar projeto Railway como um único serviço;
- obrigar todo serviço a possuir repositório;
- excluir recurso externo ao excluir projeto local;
- considerar falha de autenticação como serviço offline;
- considerar deployment concluído como health check bem-sucedido;
- criar query key com string solta;
- criar polling manual com `setInterval` em página;
- apagar cache para provocar atualização;
- esconder erro retornando array vazio;
- refatorar toda a arquitetura durante uma feature pequena;
- editar arquivos gerados sem necessidade;
- alterar `src-tauri` por conveniência.

---

## 21. Validação antes de concluir uma tarefa

Antes de finalizar, o agente deve:

1. revisar todos os arquivos alterados;
2. confirmar que não criou pasta fora da arquitetura;
3. confirmar que não adicionou dependência sem autorização;
4. confirmar que não expôs token ou segredo;
5. confirmar que páginas não chamam API ou SQL diretamente;
6. confirmar que query keys usam `Enum.QueryKey`;
7. confirmar que componentes usam Tailwind e shadcn;
8. confirmar que não criou `.styles.ts`;
9. confirmar que erros, loading e vazio foram tratados;
10. executar os comandos disponíveis no projeto.

Comandos mínimos, quando configurados:

```bash
pnpm build
pnpm lint
pnpm test
```

Não executar `pnpm tauri build` sem necessidade, pois é um build nativo mais pesado.

Quando a alteração depender de Tauri, validar também com:

```bash
pnpm tauri dev
```

Se algum comando não existir ou não puder ser executado, informar claramente no resumo final.

---

## 22. Resposta final esperada do agente

Ao concluir uma tarefa, informar de forma objetiva:

- o que foi implementado;
- quais arquivos principais foram alterados;
- quais comandos foram executados;
- se os comandos passaram ou falharam;
- qualquer pendência, limitação ou decisão que precise de confirmação.

Não afirmar que algo foi testado se não foi executado.

---

## 23. Princípio final

O padrão esperado é:

```txt
Pages
    ↓
Page hooks
    ↓
API controllers / SQL repositories
    ↓
Integrations / SQLite
```

Para interface:

```txt
Pages
    ↓
Components de domínio
    ↓
shadcn/ui
    ↓
Tailwind CSS
```

Todo código novo deve ser simples, tipado, previsível, localmente persistente quando necessário e compatível com o funcionamento desktop do Tauri.
