# Runbook: release (main → staging → production)

Owner of the release decision: the QAE. Branching model: [ADR 0002](../adr/0002-gitlab-flow-with-environment-branches.md).

## 0. Readiness

```bash
gh pr list --base main --state open          # nothing release-relevant still open
gh run list --branch main --limit 3          # CI green on main
git fetch && git log origin/staging..origin/main --oneline   # what this release contains
```

Decide: scope, risk, rollback plan (previous tag).

## 1. Promote to staging

```bash
gh pr create --base staging --head main --title "release: sprint N to staging" --body "<list of PRs>"
```

Merging triggers `.github/workflows/deploy-staging.yml`: builds images, starts the staging stack
on the runner, runs `@smoke` tests, uploads report and logs. Locally, reproduce the environment:

```bash
docker compose -f docker-compose.staging.yml up -d --build --wait
E2E_NO_SERVER=1 API_URL=http://localhost:3100 WEB_URL=http://localhost:8100 pnpm test:smoke
```

## 2. Validate on staging

- Full suite: `E2E_NO_SERVER=1 API_URL=http://localhost:3100 WEB_URL=http://localhost:8100 pnpm test:e2e`
- Exploratory session on the riskiest change (charter + notes in `docs/testing/exploratory/`).
- Write the **release validation report** as a comment on the staging PR: scope, results (link
  to the CI run), known issues with severity, accepted risks, decision (go / no-go).

## 3. Promote to production

```bash
gh pr create --base production --head staging --title "release: vX.Y.Z" --body "<validation summary>"
```

Merging triggers `deploy-production.yml`. The `production` GitHub Environment waits for manual
approval: review the pending deployment in the Actions tab and approve. Then:

```bash
git tag -a vX.Y.Z -m "Sprint N release" && git push origin vX.Y.Z
```

Write release notes in `docs/releases/vX.Y.Z.md`.

## 4. Rollback

Redeploy the previous tag's stack: `git checkout vX.Y.(Z-1)` in a clean worktree, run the
production compose for that revision, smoke it, then open a `hotfix/*` branch from `production`
to fix forward. Record the incident in `docs/postmortems/`.
