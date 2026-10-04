---
name: release
description: Guide the QAE through release validation following GitLab Flow: promote main to staging, run smoke and regression, validate, approve the production environment, promote to production, write release notes. Use when the user says /release, "vamos a desplegar", "release validation" or the sprint's stories are validated.
---

# Release validation (GitLab Flow: main → staging → production)

Talk to Antonio in Spanish; artefacts in English. **Antonio owns the release decision.** You
guide and ask; he runs the commands and signs off. Use `docs/runbooks/release.md` as the source
of truth and keep it updated if a step changes.

## Steps

1. **Readiness check.** `gh pr list --base main --state open` (nothing pending that belongs to
   the release), `gh issue list --milestone "Sprint N" --state open` (what is consciously left
   out), CI on `main` green (`gh run list --branch main --limit 3`). Ask Antonio: what is in this
   release, what is the risk, what is the rollback plan?
2. **Promote to staging.** Antonio opens the PR `main → staging`
   (`gh pr create --base staging --head main --title "release: sprint N to staging"`), with a body
   listing included PRs (`git log staging..main --oneline`). CI runs the deploy-staging workflow;
   locally he brings up the staging environment: `docker compose -f docker-compose.staging.yml
up -d --build` and runs migrations.
3. **Smoke on staging.** `pnpm --filter e2e test --grep @smoke` against the staging URL
   (`BASE_URL`/`API_URL` env). If smoke fails: stop, open a bug, do not proceed. Ask Antonio to
   justify the smoke set: is it the minimum that proves the release is alive?
4. **Regression + exploratory on staging.** Full E2E/API suite against staging plus a short
   time-boxed exploratory session on the riskiest story (Antonio writes a 5-line charter and
   notes in `docs/testing/exploratory/sprint-NN.md`).
5. **Go / no-go.** Antonio writes a **release validation report** as a comment on the staging PR:
   scope, test results (link to CI run), known issues with severity, risks accepted, decision.
   Merge (fast-forward) if go.
6. **Promote to production.** PR `staging → production`. The `production` GitHub Environment
   requires Antonio's manual approval: he approves in the Actions UI (or `gh run` + web). Local
   production environment: `docker compose -f docker-compose.production.yml up -d --build`.
   Smoke again on production. Tag: `git tag -a vX.Y.Z -m "Sprint N release"` and push the tag.
7. **Release notes.** Antonio drafts `docs/releases/vX.Y.Z.md` (features, fixes, known issues,
   validation summary). The PM (`product-manager`) reviews wording for customers.
8. **Rollback drill (once per 2 sprints).** Ask Antonio how he would roll back and have him
   actually do it once on staging: redeploy previous tag, verify smoke, redeploy current.
9. **Living documentation.** Add a "Release" section to `docs/learning/sprint-NN.md`: what was
   validated, how long the loop took, what would make it faster or safer.
