# Architecture overview

```
 browser ──► web (React, Vite dev :5173 / nginx :80)
                │  /api/*  (proxy strips the prefix)
                ▼
             api (Fastify :3000) ──► PostgreSQL (Prisma)
                │
                └── /docs (OpenAPI generated from the same zod schemas that validate requests)
```

- **Contracts** live in `packages/shared` as zod schemas. The API validates with them, the
  OpenAPI document is generated from them, the web app parses responses with them, and the E2E
  tests assert against them. One source of truth, four consumers.
- **Composition**: `apps/api/src/app.ts` builds the Fastify instance from explicit dependencies
  (`buildApp(deps)`); `server.ts` wires the real ones (Prisma, config from environment).
- **Environments**: dev runs api and web as processes and only PostgreSQL in Docker; staging and
  production run everything in Docker Compose with their own ports and databases
  (see [local development runbook](../runbooks/local-development.md)).

Detailed decisions: [ADR index](../adr/README.md).
