# Contributing

## Branches (GitLab Flow)

| Branch                                     | Purpose                            | Merges into                       |
| ------------------------------------------ | ---------------------------------- | --------------------------------- |
| `feature/<issue>-<slug>`                   | a user story or task               | `main` via PR                     |
| `fix/<issue>-<slug>`                       | a bug fix                          | `main` via PR                     |
| `docs/<slug>`, `chore/<slug>`, `ci/<slug>` | non-product changes                | `main` via PR                     |
| `main`                                     | integration branch, always green   | `staging` via release PR          |
| `staging`                                  | release candidate under validation | `production` via release PR       |
| `production`                               | what customers use                 | —                                 |
| `hotfix/<slug>`                            | urgent production fix              | `production`, then back to `main` |

Never push directly to `main`, `staging` or `production`. Never force-push a shared branch.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) in English:
`feat(api): reject bookings beyond room capacity`. Body explains _why_. Scopes: `api`, `web`,
`shared`, `e2e`, `ci`, `docs`, `infra`.

## Pull requests

Use the template. Link the issue (`Closes #n`). CI must be green. A PR is merged only after
code review by the Tech Lead **and** behaviour validation by QA (label `status:needs-qa`
removed, validation comment on the PR).

## Definition of Done

- Acceptance criteria met and demonstrated
- Unit tests for the change; integration/E2E tests where the test plan says so
- CI green on the PR
- Tech Lead approved; QA validated
- Documentation updated when behaviour, contracts or setup changed

## Labels

`type:story|bug|task|tech-debt` · `priority:P0..P3` · `risk:high|medium|low` ·
`area:api|web|infra|tests|docs` · `status:needs-triage|needs-qa|blocked`
