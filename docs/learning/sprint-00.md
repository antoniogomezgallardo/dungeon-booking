# Sprint 0: foundations (2026-10-04)

## Summary

The squad set up the repository, the stack and the ways of working before any product feature.
The QAE joined at the end to review the foundations and prepare Sprint 1.

## What was built

- pnpm monorepo: `apps/api` (Fastify + Prisma + PostgreSQL), `apps/web` (React + Vite),
  `packages/shared` (zod contracts), `tests/e2e` (Playwright).
- `GET /health` with a real database check, OpenAPI at `/docs`, a home page showing API status.
- Test levels in place with one example each: unit (API and web), integration (API + DB),
  black-box API and browser smoke tests tagged `@smoke`.
- CI (`ci.yml`) with separate jobs per level; environment deployments simulated on the runner.
- GitLab Flow branches `main`, `staging`, `production`; `production` gated by manual approval.
- ADRs 0001-0003; test strategy skeleton; runbooks; this learning layer.

## Decisions worth remembering

- Health returns **503 + `degraded`** when the database is down, not 200. A load balancer or a
  smoke test must be able to tell "alive" from "healthy" with the status code alone.
- The app receives its database through a tiny `Database` port (`buildApp(deps)`), so unit
  tests fake it and integration tests use Prisma. Same code, two levels.
- Smoke tests are selected by the `@smoke` tag, not by folder, so any test can be promoted to
  smoke without moving it.

## What broke

The first deployment to staging failed: the API container applied its migrations and started
listening, yet never became healthy. CI had been green. The investigation, the wrong hypotheses
and the two compounding causes (missing OpenSSL on Alpine for the Prisma client, and a health
endpoint that answered 503 without logging why) are in the
[postmortem](../postmortems/2026-10-04-staging-api-container-unhealthy.md). It is the worked
example of the format the QAE will use from Sprint 1.

## For the QAE: first tasks

1. Read ADR 0003 and the four example tests; run every level locally.
2. Join `/refinement` for Sprint 1 and write QA notes on each story.
3. Draft `docs/testing/strategy.md` during Sprint 1.

## Journal

_(entries added with `/journal`)_
