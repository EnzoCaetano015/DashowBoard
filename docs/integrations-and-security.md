# Integrations and security

[← Back to README](../README.md)

DashowBoard integrates GitHub, Vercel, Railway, and Supabase. Each provider has independent contracts, queries, and error handling.

## Provider responsibilities

**GitHub** represents the source code: repositories, branches, commits, languages, issues, pull requests, and workflows.

**Vercel** represents application projects and deployments. A completed deployment is not a substitute for an availability health check.

**Railway** projects can have multiple environments and services. Aggregate status is computed from monitored services rather than reducing the provider to one boolean.

**Supabase** represents projects, APIs, and databases. Administrative project state, API availability, and database availability are distinct signals.

## Credentials

Tokens are local secrets:

- Never use `VITE_*` variables for credentials.
- Never put tokens in source code, logs, or tracked files.
- Never show a complete saved token in the interface.
- Request only the scopes the integration needs.
- Send each token only to its corresponding provider.
- Store credentials through the operating system's secure native layer.

The frontend requests operations through Tauri commands. Rust clients call the providers, and credentials are protected by the native keyring where supported.

## Network permissions

Tauri capabilities allow only the endpoints needed by the integrations:

- `api.github.com`
- `api.vercel.com`
- `backboard.railway.com`
- `api.supabase.com`

Adding a domain requires an explicit, narrowly scoped change to `src-tauri/capabilities/default.json`.

## Errors

Distinguish resource unavailability, invalid credentials, rate limits, timeouts, missing configuration, and unknown errors. Never silently convert a failed query into an empty list. When combining providers, one failure must not cancel valid results from the others.
