# Domínio e monitoramento

[← Voltar ao README](../README.md)

## Entidades

### Projeto

É o agrupador local criado pelo usuário. Pode reunir repositórios, serviços, integrações, configurações de monitoramento e histórico. Excluir um projeto remove somente os dados e vínculos locais.

### Repositório

Representa código hospedado no GitHub. Pode assumir papéis como frontend, API, worker, biblioteca, infraestrutura ou documentação e pode estar associado a vários serviços.

### Serviço

Representa um recurso executado por um provider: frontend, API, worker, banco de dados, cache, fila ou cron job. Um serviço pode existir sem repositório relacionado.

### Integração

É o vínculo local entre uma entidade do DashowBoard e um recurso externo, como um repositório GitHub, projeto Vercel, serviço Railway ou projeto Supabase.

### Incidente

É uma mudança relevante de estado, como a indisponibilidade ou recuperação de um serviço, falha de deployment ou invalidação de uma credencial. Consultas repetidas com o mesmo resultado não geram novos incidentes.

## Status agregados

| Status | Significado |
|---|---|
| Saudável | Todos os serviços críticos estão disponíveis. |
| Degradado | Pelo menos um serviço crítico está indisponível. |
| Offline | Todos os serviços críticos estão indisponíveis. |
| Atualizando | Há deployment ou sincronização em andamento. |
| Desconhecido | Não há resposta confiável ou a integração não pôde ser consultada. |

Falhas de autenticação não significam que o serviço está offline. Nesses casos, a integração deve ser tratada como desconhecida ou inválida.

## Ciclo de monitoramento

1. o TanStack Query consulta cada provider de forma independente;
2. os dados externos são normalizados para o domínio do aplicativo;
3. o status atual é comparado com o último estado persistido;
4. uma alteração relevante gera histórico e, quando aplicável, um incidente;
5. a interface apresenta o estado agregado sem ocultar falhas parciais.

O polling é configurado de forma centralizada. Atualizações manuais usam `refetch` ou invalidação de query, sem recarregar toda a janela.

