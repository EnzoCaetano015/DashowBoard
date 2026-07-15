export namespace Enum {
    export enum Provider {
        GitHub = "github",
        Vercel = "vercel",
        Railway = "railway",
        Supabase = "supabase",
    }

    export enum StatusProjeto {
        Saudavel = "healthy",
        Degradado = "degraded",
        Offline = "offline",
        Atualizando = "updating",
        Desconhecido = "unknown",
    }

    export enum TipoServico {
        Frontend = "Frontend",
        Api = "API",
        Worker = "Worker",
        BancoDados = "Banco de dados",
        Cache = "Cache",
        Fila = "Fila",
        CronJob = "Cron job",
    }

    export enum TagRepositorio {
        Frontend = "Frontend",
        Api = "API",
        Worker = "Worker",
        Biblioteca = "Biblioteca",
        Infraestrutura = "Infraestrutura",
        Documentacao = "Documentação",
    }

    export enum StatusDeployment {
        Sucesso = "success",
        Falha = "failed",
        EmAndamento = "building",
    }

    export enum StatusWorkflow {
        Sucesso = "success",
        Falha = "failure",
        EmAndamento = "running",
        Desconhecido = "unknown",
    }

    export enum StatusIncidente {
        Resolvido = "resolved",
        EmAndamento = "ongoing",
        Monitorando = "monitoring",
    }

    export enum SeveridadeIncidente {
        Baixa = "low",
        Media = "medium",
        Alta = "high",
    }

    export enum StatusIntegracao {
        Conectado = "connected",
        Desconectado = "disconnected",
        Erro = "error",
        EmBreve = "coming-soon",
    }

    export enum TipoConexaoGitHub {
        Pessoal = "personal",
        Organizacao = "organization",
    }

}
