# Runbook: local development

## Prerequisites

- Node 22: `nvm install 22 && nvm use` (the repo has an `.nvmrc`).
- pnpm: `corepack enable` (version comes from `packageManager` in `package.json`).
- Docker with Compose, and your user in the `docker` group:
  `sudo usermod -aG docker $USER`, then log out and in (or `newgrp docker`).

## First run

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up          # starts PostgreSQL (docker compose up -d db)
pnpm db:deploy      # prisma migrate deploy
pnpm dev            # api :3000 + web :5173
```

Expected: `curl -s localhost:3000/health` returns `"status":"ok"` and `"database":"up"`.
<http://localhost:5173> shows the API pill in green.

If `/health` returns 503 with `"database":"down"`, PostgreSQL is not reachable: check
`docker compose ps` and `DATABASE_URL` in `apps/api/.env`.

## Everyday commands

| Task                                        | Command                                            |
| ------------------------------------------- | -------------------------------------------------- |
| Static checks                               | `pnpm lint && pnpm typecheck`                      |
| Unit tests                                  | `pnpm test`                                        |
| Integration tests (needs DB)                | `pnpm test:integration`                            |
| E2E (starts api and web)                    | `pnpm test:e2e`                                    |
| Smoke only                                  | `pnpm test:smoke`                                  |
| Playwright UI mode                          | `pnpm --filter e2e test:ui`                        |
| Open last Playwright report                 | `pnpm --filter e2e report`                         |
| New migration after editing `schema.prisma` | `pnpm --filter api db:migrate:dev --name <change>` |
| Reset the dev database                      | `pnpm --filter api db:reset`                       |
| Browse data                                 | `pnpm --filter api db:studio`                      |
| Stop the database                           | `pnpm db:down`                                     |

## Running staging or production locally

```bash
docker compose -f docker-compose.staging.yml up -d --build --wait      # web :8100, api :3100
docker compose -f docker-compose.production.yml up -d --build --wait   # web :8200, api :3200
```

Smoke against one of them:

```bash
E2E_NO_SERVER=1 API_URL=http://localhost:3100 WEB_URL=http://localhost:8100 pnpm test:smoke
```

Tear down with `docker compose -f docker-compose.staging.yml down -v` (the `-v` drops the data).
