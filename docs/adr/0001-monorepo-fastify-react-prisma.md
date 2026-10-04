# ADR 0001: TypeScript monorepo with Fastify API, React SPA and Prisma on PostgreSQL

- Status: accepted
- Date: 2026-10-04
- Author: Jordan Okafor (Tech Lead)

## Context

Dungeon Booking needs an HTTP API, a web front end and a relational database. The team wants a
clear boundary between API and UI so quality work can target each level explicitly (API tests,
integration tests, browser tests), and wants everything in TypeScript so one language covers
product code and tests.

## Decision

- **pnpm workspaces** monorepo: `apps/api`, `apps/web`, `packages/shared`, `tests/e2e`.
- **API**: Fastify 5 with `fastify-type-provider-zod`, so every route's input and output schema
  is a zod schema that also generates the OpenAPI document served at `/docs`.
- **Web**: React with Vite. The browser calls the API through a same-origin `/api` prefix that
  Vite (dev) or nginx (containers) forwards to Fastify, so no CORS configuration is needed.
- **Data**: PostgreSQL with Prisma 6 (schema, migrations, typed client). Prisma is pinned to 6.x
  on purpose: version 7 changes the configuration model and would add friction without value for
  this project's goals.
- **Shared contracts**: `packages/shared` holds zod schemas and types used by API, web and E2E
  tests. During development each package resolves it from source via `tsconfig` `paths` and a
  Vite alias; in production containers it is built to `dist` first.
- **Dependency injection at the edge**: `buildApp(deps)` receives a small `Database` port so unit
  tests run without PostgreSQL and integration tests pass the real Prisma adapter.

## Consequences

- API and UI can be tested, deployed and reasoned about independently.
- OpenAPI is always in sync with validation because both come from the same zod schemas; QA can
  write contract tests against `/docs/json`.
- The monorepo adds some tooling (workspace filters, aliases) that newcomers must learn.
- Container images copy the whole workspace rather than a pruned deployment; acceptable now,
  revisit (`pnpm deploy`) if image size or build time becomes a problem.

## Alternatives considered

- **Next.js full-stack**: faster to start, but blurs the API/UI boundary the training needs.
- **NestJS**: more structure than this team size needs; Fastify plus zod is enough.
- **Drizzle instead of Prisma**: viable; Prisma chosen for its migration workflow and Studio.
