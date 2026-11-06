# Domain and monitoring

[← Back to README](../README.md)

## Entities

**Project** is a local group created by the user. It can contain repositories, services, integrations, monitoring settings, and history. Deleting it removes only local data and links.

**Repository** represents code hosted on GitHub. Roles include frontend, API, worker, library, infrastructure, and documentation. A repository can be linked to several services.

**Service** represents a hosted resource: frontend, API, worker, database, cache, queue, or cron job. A service does not require an associated repository.

**Integration** links a local DashowBoard entity to an external resource, such as a GitHub repository, Vercel project, Railway service, or Supabase project.

**Incident** represents a meaningful state change, such as an unavailable or recovered service, a deployment failure, or an invalid credential. Repeated observations of the same state do not create duplicate incidents.

## Aggregate statuses

| Status | Meaning |
|---|---|
| Healthy | All critical services are available. |
| Degraded | At least one critical service is unavailable. |
| Offline | All critical services are unavailable. |
| Updating | Deployment or synchronization is in progress. |
| Unknown | No reliable response is available, or the integration could not be queried. |

Authentication errors do not mean the service is offline. Treat those results as unknown or as an invalid integration.

## Monitoring cycle

1. TanStack Query polls each provider independently.
2. External responses are normalized into domain models.
3. The current status is compared with the last persisted observation.
4. A meaningful transition creates history and, when applicable, an incident.
5. The interface shows the aggregate state without hiding partial failures.

Polling intervals are centralized. Manual refresh uses query refetching or invalidation without reloading the window. Incidents and observations use UTC ISO 8601 timestamps; dates, numbers, and presentation labels are displayed in English.
