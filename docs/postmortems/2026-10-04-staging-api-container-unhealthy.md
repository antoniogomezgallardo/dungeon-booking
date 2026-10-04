# Staging deployment failed: API container never became healthy

- Date: 2026-10-04
- Environment: staging (Docker Compose stack on the GitHub Actions runner)
- Severity: S2 (blocked the first deployment; no customers affected)
- Author: Jordan Okafor (Tech Lead). Written as the worked example of this format; from
  Sprint 1 on, postmortems are written by the QAE.

## Symptoms

The first push to `staging` ran the deploy workflow. `docker compose up --wait` failed after
about two minutes with:

```
dependency failed to start: container dungeon-staging-api-1 is unhealthy
```

CI on `main` was green, including integration and E2E tests against PostgreSQL, so the code
itself worked somewhere.

## Timeline

| Time (UTC) | Event                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| 21:16      | Branches `staging` and `production` pushed; both deploy workflows start     |
| 21:18      | Both fail on the compose `--wait` step                                      |
| 21:22      | Container logs downloaded from the run artefact                             |
| 21:27      | Fix branch pushed, PR #1 opened, staging workflow rehearsed from the branch |
| 21:30      | Rehearsal green (3 smoke tests pass); PR merged                             |

## Hypotheses tried (including the wrong ones)

1. **The image did not build.** Wrong: the build stage finished and the container started.
2. **Migrations failed.** Wrong: the container log showed the migration applied successfully.
3. **The server did not listen.** Wrong: Fastify logged "Server listening" 97 seconds before the
   failure, so roughly 19 health checks ran against a listening server and all failed.
4. **The health check command itself was broken.** Partially right: busybox `wget` fails on
   any non-2xx status, so a 503 from `/health` looks identical to "nothing listening".
5. **`/health` was answering 503.** Right, but invisible: the database ping error was caught and
   discarded, so the log contained no reason.

## Diagnosis path

- `gh run view <id> --log-failed` showed only the compose error: not enough.
- The workflow uploads `docker compose logs` as an artefact even on failure
  (`if: !cancelled()`); `gh run download` gave the API container's log: migration OK, server
  listening. This ruled out hypotheses 1-3 in one step.
- Comparing what worked (`prisma migrate`, a standalone binary) with what did not (the Prisma
  **client** inside Node) pointed at a runtime difference between the two: the query engine is
  a shared library that needs OpenSSL, which `node:22-alpine` does not ship.
- The 503 had no log line because `prismaDatabase.ping()` swallowed the error. That is the
  defect that made the incident expensive, independently of the OpenSSL cause.

## Root cause

Two defects compounded: the Alpine image lacked `openssl` so the Prisma client could not load
its engine (`/health` → 503), and the health endpoint logged nothing when the ping failed, so
the only observable symptom was "unhealthy".

## Fix

[PR #1](https://github.com/antoniogomezgallardo/dungeon-booking/pull/1): install `openssl` in
the image; make the `Database` port reject with the real error and log it at `warn` in
`/health`; health check via Node `fetch` that is healthy only on 2xx, with a `start_period` so
migration time is not counted; `workflow_dispatch` on the deploy workflows so a deployment can
be rehearsed from any branch; a diagnostics step that prints container health logs on failure.

## Lessons

- **A failing check must say why.** A 503 with no log line turns a two-minute fix into an
  investigation. Every "degraded" answer should carry its cause in the logs.
- **Green CI is not a green deployment.** CI ran the API as a process on Ubuntu; the container
  runs it on Alpine. Different runtime, different failure. Smoke tests on the real artefact are
  not optional.
- **Rehearse deployments from a branch.** `workflow_dispatch` turned "merge and hope" into
  "verify, then merge".
- **Keep the artefacts.** Uploading container logs on failure was the single most useful
  decision in this workflow.

## Prevention

- Health check and logging fixed (PR #1).
- Deploy workflows now print `docker inspect` health logs on failure.
- Candidate for the QAE's test strategy: a smoke test that fails loudly when `/health` is
  degraded and prints the response body.
