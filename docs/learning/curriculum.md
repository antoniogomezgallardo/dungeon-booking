# Curriculum: learning goals by sprint

Each sprint the squad delivers product features and the QAE practises specific Quality
Engineering skills on them. Features are chosen so the risk they carry matches the skill.

| Sprint | Product features (developer)                                                              | QAE focus                                                                                                                                     | Evidence expected                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1      | Auth (register, login, JWT), roles owner/staff/customer, CRUD venues and rooms            | Write the test strategy; participate in refinement for real; first black-box API tests with Playwright `request`; smoke suite; read PR diffs  | `docs/testing/strategy.md` filled; `tests/e2e/tests/**/*.api.spec.ts`; QA notes on issues; validation comments on PRs |
| 2      | Time slots, availability, create/cancel booking, capacity                                 | **Risk-based testing** with a written risk matrix; time zones and DST; integration tests with the real DB; high-quality bug reports           | Test plans per story; integration tests; bug issues with evidence                                                     |
| 3      | Waitlist, promo codes, pricing rules, cancellation policies                               | **Investigating complex failures**: concurrency and race conditions, reading logs and DB state, Playwright traces; E2E of critical journeys   | Postmortem write-ups; E2E specs for critical flows                                                                    |
| 4      | Notifications (email mock), simulated payments with webhooks, occupancy dashboard         | Contract testing against OpenAPI; mocks and stubs; **reliability**: flaky tests policy, test data strategy, CI feedback time, quality metrics | CI improvements (PRs by the QAE); flaky-test policy in the strategy; metrics in the sprint journal                    |
| 5      | Release hardening, observability (request ids, structured logs), basic performance checks | **Release validation** end to end: smoke, regression, quality gates, rollback drill; global retro; quality ownership                          | Release validation reports; tagged releases; release notes; final retro                                               |

## Cross-cutting goals (every sprint)

- Participate from refinement: ask, find gaps, propose validations before code exists.
- Read code and debug: open the PR diff before testing; locate causes in code, logs or data.
- TypeScript: write idiomatic test code; understand the production code you test.
- English: all artefacts in English; the mentor offers optional corrections.
- Ownership: block merges when justified; propose process or pipeline improvements; keep this
  documentation alive.
