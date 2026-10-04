# Dungeon Booking

Bookings SaaS for escape rooms and board-game cafés: venues publish rooms and time slots,
customers book seats, owners manage capacity, waitlists, promo codes, payments and reminders.

This repository is also a **Quality Engineering training ground**: a simulated product squad
(PM, Tech Lead, Senior Developer, played by AI agents) delivers the product sprint by sprint while
a human QAE owns quality end to end. See [CLAUDE.md](CLAUDE.md) for how the simulation works and
[docs/learning/](docs/learning/README.md) for the pedagogical layer.

## Quick start (5 minutes)

Prerequisites: Node 22 (`nvm use`), pnpm (via `corepack enable`), Docker with Compose.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up            # PostgreSQL in Docker
pnpm db:deploy        # apply migrations
pnpm dev              # api on :3000, web on :5173
```

Check it works:

- API health: <http://localhost:3000/health>
- OpenAPI UI: <http://localhost:3000/docs>
- Web app: <http://localhost:5173>

Run the checks:

```bash
pnpm lint && pnpm typecheck && pnpm test     # static checks + unit tests
pnpm test:integration                        # API against the real database
pnpm test:e2e                                # Playwright (starts api and web for you)
pnpm test:smoke                              # only @smoke tests
```

## Repository layout

| Path              | What                                                       |
| ----------------- | ---------------------------------------------------------- |
| `apps/api`        | Fastify + Prisma + PostgreSQL HTTP API, OpenAPI at `/docs` |
| `apps/web`        | React + Vite single-page app                               |
| `packages/shared` | zod schemas and types shared by API, web and tests         |
| `tests/e2e`       | Playwright API and browser tests (owned by QA)             |
| `docs/`           | Living documentation, see [docs/README.md](docs/README.md) |
| `.github/`        | CI (`ci.yml`) and environment deployments (`deploy-*.yml`) |
| `.claude/`        | Squad agents and ceremony skills for the simulation        |

## How we work

- **GitLab Flow**: `feature/*` → `main` → `staging` → `production`. Details in
  [ADR 0002](docs/adr/0002-gitlab-flow-with-environment-branches.md) and the
  [release runbook](docs/runbooks/release.md).
- **Quality**: [test strategy](docs/testing/strategy.md), bug and story templates in
  `.github/ISSUE_TEMPLATE/`.
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md).
