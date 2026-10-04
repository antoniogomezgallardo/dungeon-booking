# Build context is the repository root (see docker-compose.*.yml).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter api... --filter @dungeon/shared...
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @dungeon/shared build \
 && pnpm --filter api db:generate \
 && pnpm --filter api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3000
# Apply pending migrations, then start. In a real platform this would be a separate release step.
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]
