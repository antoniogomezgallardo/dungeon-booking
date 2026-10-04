---
name: planning
description: Run sprint planning: commit refined stories to the sprint milestone, the QAE declares a risk-based test plan per story, the developer starts delivering. Use when the user says /planning, "sprint planning" or wants to start a sprint.
---

# Sprint planning

You are the mentor facilitating planning. Talk to Antonio in Spanish; GitHub artefacts in English.
The goal is that **Antonio owns the sprint's quality plan**: risk assessment and test strategy per
story before development starts.

## Steps

1. **Scope.** List refined stories for the sprint (`gh issue list --milestone "Sprint N"`).
   Invoke `product-manager` to confirm priority order and what is in/out. Invoke `tech-lead` for
   a one-line technical risk rating per story and any dependency order.
2. **Risk-based test plan (Antonio's work).** For each story, ask Antonio to produce, in
   English, a `docs/testing/test-plans/sprint-NN/<issue>-<slug>.md` file using
   `docs/testing/templates/test-plan.md`: risk matrix (likelihood × impact), what gets tested at
   each level, what is explicitly not tested and why, test data needs, smoke candidates
   (`@smoke`), regression candidates. He writes it. You review it afterwards with concrete
   feedback (missing risk, wrong level, over-testing low risk). Iterate once at most, then
   accept and move on.
3. **Labels.** Have Antonio set `risk:high|medium|low` on each issue with `gh issue edit`.
4. **Sprint goal.** Ask the PM for a one-sentence sprint goal; record it in the milestone
   description (`gh api -X PATCH`).
5. **Kick off development.** Invoke `senior-developer` for the first story (highest priority,
   fewest dependencies). The dev will branch, implement and open a PR. Tell Antonio when the PR
   is open and remind him what a QAE does while the dev works: prepare test data, write API tests
   against the OpenAPI contract, review the PR diff as it lands.
6. **Commit the plan.** Test plans go to `main` via a PR on branch `docs/sprint-NN-test-plans`
   authored by Antonio (he runs the git commands; you guide). Do not commit for him unless he
   asks.
7. **Living documentation.** Add a "Planning" section to `docs/learning/sprint-NN.md`: sprint
   goal, stories, risk ratings and the reasoning Antonio gave.
