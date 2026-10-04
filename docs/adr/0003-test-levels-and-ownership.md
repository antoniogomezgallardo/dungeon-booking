# ADR 0003: Test levels, where they live, and who owns them

- Status: accepted
- Date: 2026-10-04
- Author: Jordan Okafor (Tech Lead), with the QAE

## Context

Tests at different levels answer different questions and cost different amounts. We want the
levels, their location and their owners to be explicit so nobody wonders "where does this test
go?" and so quality ownership is clear.

## Decision

| Level           | Question it answers                                         | Location                            | Runner                   | Owner           |
| --------------- | ----------------------------------------------------------- | ----------------------------------- | ------------------------ | --------------- |
| Unit            | Does this function/component behave given these inputs?     | next to the code, `*.test.ts(x)`    | Vitest                   | Developer       |
| Integration     | Does the API behave correctly with a real database?         | `apps/api/test/integration`         | Vitest (separate config) | Developer + QAE |
| API (black-box) | Does the running service honour its contract over HTTP?     | `tests/e2e/tests/**/*.api.spec.ts`  | Playwright `api` project | **QAE**         |
| E2E (browser)   | Do critical user journeys work through the real UI and API? | `tests/e2e/tests/**/*.web.spec.ts`  | Playwright `web` project | **QAE**         |
| Smoke           | Is a deployment alive?                                      | any Playwright test tagged `@smoke` | release workflows        | **QAE**         |

- Smoke tests are a small, fast subset and must pass on every environment before anything else.
- E2E tests use `data-testid` or accessible roles for locators; developers add `data-testid` to
  every interactive element.
- The test strategy document (`docs/testing/strategy.md`) and per-story test plans decide what
  gets tested at which level, using risk as the main criterion.

## Consequences

- Every level has one place and one owner; CI runs them as separate jobs so feedback is fast
  and failures are easy to attribute.
- The QAE owns the black-box layers and the release gate, and shares integration testing with
  developers.

## Alternatives considered

- Supertest for API tests: fine, but Playwright already gives us HTTP testing, tracing and a
  single reporter for API and browser.
- Cypress for E2E: Playwright chosen for multi-browser support, API testing and trace viewer.
