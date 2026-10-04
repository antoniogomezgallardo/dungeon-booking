# ADR 0002: GitLab Flow with environment branches

- Status: accepted
- Date: 2026-10-04
- Author: Jordan Okafor (Tech Lead)

## Context

We want a branching model that (a) keeps a single integration branch always green, (b) makes
promotion to each environment an explicit, reviewable step so release validation is a real
activity, and (c) stays simpler than git-flow.

## Decision

GitLab Flow with **environment branches**:

```
feature/*  --PR-->  main  --release PR-->  staging  --release PR-->  production
                     ^                                                   |
                     +------------------- hotfix/* merged back ----------+
```

- `main`: integration. Every change arrives by PR with green CI, Tech Lead review and QA
  validation.
- `staging`: release candidate. A release PR `main → staging` triggers the staging deployment
  and smoke tests. QA runs regression and exploratory testing here and writes the validation
  report on the PR.
- `production`: what customers use. A release PR `staging → production` triggers the production
  deployment, which is gated by the `production` GitHub Environment requiring manual approval
  from the QAE. Releases are tagged `vX.Y.Z`.
- Promotions are fast-forward merges (`staging` and `production` never contain commits that are
  not in `main`), except hotfixes: `hotfix/*` from `production`, merged into `production` and
  then back into `main` (and `staging`).

## Consequences

- Release validation becomes a first-class, observable step with artefacts (smoke report,
  validation comment, tag), which is exactly what the QAE needs to practise.
- Three long-lived branches to protect and keep in sync; the release runbook covers it.
- Environments are simulated with Docker Compose on the CI runner and locally; the same
  workflows would point at real infrastructure later without changing the branching model.

## Alternatives considered

- **GitHub Flow** (main + deploy on merge): simplest, but no explicit staging step to validate.
- **git-flow**: `develop`/`release/*`/`hotfix/*` is more ceremony than a continuously delivered
  SaaS needs.
- **Trunk-based with feature flags**: ideal at scale, but hides the release step we want to
  practise explicitly.
