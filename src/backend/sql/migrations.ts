import type Database from "@tauri-apps/plugin-sql"

type Migracao = {
    versao: number
    nome: string
    comandos: string[]
}

type MigracaoAplicada = {
    versao: number
}

const MIGRACOES: Migracao[] = [
    {
        versao: 1,
        nome: "criar_preferencias_aplicacao",
        comandos: [
            `
                CREATE TABLE IF NOT EXISTS preferencias_aplicacao (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    iniciar_com_sistema INTEGER NOT NULL CHECK (iniciar_com_sistema IN (0, 1)),
                    verificacao_segundo_plano INTEGER NOT NULL CHECK (verificacao_segundo_plano IN (0, 1)),
                    intervalo_padrao_segundos INTEGER NOT NULL CHECK (intervalo_padrao_segundos IN (30, 60, 300)),
                    notificacoes_sistema INTEGER NOT NULL CHECK (notificacoes_sistema IN (0, 1)),
                    som_incidente INTEGER NOT NULL CHECK (som_incidente IN (0, 1)),
                    badge_icone INTEGER NOT NULL CHECK (badge_icone IN (0, 1)),
                    tema TEXT NOT NULL CHECK (tema IN ('dark', 'light', 'system')),
                    densidade TEXT NOT NULL CHECK (densidade IN ('comfortable', 'compact')),
                    nome_desenvolvedor TEXT NOT NULL,
                    atualizado_em TEXT NOT NULL
                )
            `,
            `
                INSERT OR IGNORE INTO preferencias_aplicacao (
                    id,
                    iniciar_com_sistema,
                    verificacao_segundo_plano,
                    intervalo_padrao_segundos,
                    notificacoes_sistema,
                    som_incidente,
                    badge_icone,
                    tema,
                    densidade,
                    nome_desenvolvedor,
                    atualizado_em
                ) VALUES (1, 0, 1, 30, 0, 0, 1, 'dark', 'comfortable', '', CURRENT_TIMESTAMP)
            `,
        ],
    },
    {
        versao: 2,
        nome: "criar_projetos_monitoramento_incidentes",
        comandos: [
            `
                CREATE TABLE IF NOT EXISTS projetos (
                    id TEXT PRIMARY KEY,
                    nome TEXT NOT NULL,
                    descricao TEXT,
                    url_aplicacao TEXT,
                    status TEXT NOT NULL,
                    intervalo_verificacao_segundos INTEGER NOT NULL,
                    timeout_segundos INTEGER NOT NULL,
                    notificacoes_ativas INTEGER NOT NULL CHECK (notificacoes_ativas IN (0, 1)),
                    coletar_deployments INTEGER NOT NULL CHECK (coletar_deployments IN (0, 1)),
                    criado_em TEXT NOT NULL,
                    atualizado_em TEXT NOT NULL
                )
            `,
            `
                CREATE TABLE IF NOT EXISTS projeto_repositorios (
                    id TEXT PRIMARY KEY,
                    projeto_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    external_id TEXT NOT NULL,
                    connection_id TEXT,
                    nome TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    html_url TEXT,
                    tag TEXT NOT NULL,
                    snapshot_json TEXT,
                    criado_em TEXT NOT NULL,
                    atualizado_em TEXT NOT NULL,
                    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
                )
            `,
            `
                CREATE UNIQUE INDEX IF NOT EXISTS ux_projeto_repositorio_externo
                ON projeto_repositorios (
                    projeto_id,
                    provider,
                    external_id,
                    IFNULL(connection_id, '')
                )
            `,
            `
                CREATE INDEX IF NOT EXISTS ix_projeto_repositorios_projeto
                ON projeto_repositorios (projeto_id)
            `,
            `
                CREATE TABLE IF NOT EXISTS projeto_servicos (
                    id TEXT PRIMARY KEY,
                    projeto_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    external_project_id TEXT NOT NULL,
                    external_environment_id TEXT,
                    external_service_id TEXT,
                    scope_id TEXT,
                    nome TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    critico INTEGER NOT NULL CHECK (critico IN (0, 1)),
                    repositorio_id TEXT,
                    status TEXT NOT NULL,
                    snapshot_json TEXT,
                    verificado_em TEXT,
                    criado_em TEXT NOT NULL,
                    atualizado_em TEXT NOT NULL,
                    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
                    FOREIGN KEY (repositorio_id) REFERENCES projeto_repositorios(id) ON DELETE SET NULL
                )
            `,
            `
                CREATE UNIQUE INDEX IF NOT EXISTS ux_projeto_servico_externo
                ON projeto_servicos (
                    projeto_id,
                    provider,
                    external_project_id,
                    IFNULL(external_environment_id, ''),
                    IFNULL(external_service_id, ''),
                    IFNULL(scope_id, '')
                )
            `,
            `
                CREATE INDEX IF NOT EXISTS ix_projeto_servicos_projeto
                ON projeto_servicos (projeto_id)
            `,
            `
                CREATE TABLE IF NOT EXISTS status_recursos (
                    id TEXT PRIMARY KEY,
                    projeto_id TEXT NOT NULL,
                    servico_id TEXT NOT NULL,
                    status_anterior TEXT,
                    status_atual TEXT NOT NULL,
                    response_time_ms INTEGER,
                    verificado_em TEXT NOT NULL,
                    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
                    FOREIGN KEY (servico_id) REFERENCES projeto_servicos(id) ON DELETE CASCADE
                )
            `,
            `
                CREATE INDEX IF NOT EXISTS ix_status_recursos_projeto
                ON status_recursos (projeto_id, verificado_em DESC)
            `,
            `
                CREATE TABLE IF NOT EXISTS incidentes (
                    id TEXT PRIMARY KEY,
                    projeto_id TEXT NOT NULL,
                    servico_id TEXT,
                    titulo TEXT NOT NULL,
                    descricao TEXT,
                    status TEXT NOT NULL,
                    severidade TEXT NOT NULL,
                    aberto_em TEXT NOT NULL,
                    resolvido_em TEXT,
                    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
                    FOREIGN KEY (servico_id) REFERENCES projeto_servicos(id) ON DELETE SET NULL
                )
            `,
            `
                CREATE INDEX IF NOT EXISTS ix_incidentes_projeto
                ON incidentes (projeto_id, aberto_em DESC)
            `,
            `
                CREATE UNIQUE INDEX IF NOT EXISTS ux_incidente_aberto_servico
                ON incidentes (servico_id)
                WHERE resolvido_em IS NULL AND servico_id IS NOT NULL
            `,
        ],
    },
]

export const executarMigracoes = async (database: Database) => {
    await database.execute(`
        CREATE TABLE IF NOT EXISTS migracoes (
            versao INTEGER PRIMARY KEY,
            nome TEXT NOT NULL,
            aplicada_em TEXT NOT NULL
        )
    `)

    const aplicadas = await database.select<MigracaoAplicada[]>("SELECT versao FROM migracoes")
    const versoesAplicadas = new Set(aplicadas.map(({ versao }) => versao))

    for (const migracao of MIGRACOES) {
        if (versoesAplicadas.has(migracao.versao)) continue

        await database.execute("BEGIN IMMEDIATE")
        try {
            for (const comando of migracao.comandos) {
                await database.execute(comando)
            }

            await database.execute(
                "INSERT INTO migracoes (versao, nome, aplicada_em) VALUES ($1, $2, $3)",
                [migracao.versao, migracao.nome, new Date().toISOString()]
            )
            await database.execute("COMMIT")
        } catch (erro) {
            await database.execute("ROLLBACK")
            throw erro
        }
    }
}
