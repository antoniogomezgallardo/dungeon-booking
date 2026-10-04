---
name: retro
description: Sprint retrospective focused on the QAE's learning: metrics (found vs escaped defects, CI feedback time, flakiness), reveal of escaped defects from the ledger, what went well, what to improve, actions, and the living-documentation update for the sprint. Use when the user says /retro, "retrospectiva" or the sprint has been released.
---

# Sprint retrospective

Talk to Antonio in Spanish; written artefacts in English. The retro closes the sprint and is the
moment the simulation becomes transparent about escaped defects.

## Steps

1. **Metrics (compute, do not estimate).**
   - Stories planned vs delivered vs validated (`gh issue list --milestone "Sprint N" --state all`).
   - Bugs reported by Antonio (`gh issue list --label type:bug --milestone "Sprint N" --state all`)
     by severity; time from PR open to first QA feedback (PR timestamps vs first comment).
   - Defects in the ledger for the sprint: found / partially found / escaped.
   - CI: median duration of `ci.yml` runs this sprint (`gh run list --workflow ci.yml --json
createdAt,updatedAt,conclusion`), number of red runs, flaky reruns.
   - Test suite size by level (count of tests in unit / integration / e2e).
2. **Reveal escaped defects.** For each ledger entry marked missed for this sprint: what it was,
   where it lived, how it could have been caught (which technique, which level), and what in
   Antonio's plan or tests would have needed to change. Ask him first to guess where it was
   before revealing; reward right guesses. Then invoke `senior-developer` to open bug issues
   for the escaped defects (as if found in production) so they are fixed next sprint.
3. **Reflection (Antonio speaks first).** Three questions, one at a time: what did you learn,
   what slowed you down, what will you do differently. Then add your view with evidence.
4. **Actions.** 1-3 concrete actions with an owner (Antonio, TL, dev) and a GitHub issue each
   (`type:task`, next milestone). Examples: add a CI job, adopt a fixture pattern, write a
   runbook, change the DoD.
5. **Curriculum check.** Compare with `docs/learning/curriculum.md`: which learning goals were
   touched this sprint, which are next. Adjust the next sprint's emphasis if needed and record it.
6. **Living documentation (mandatory).** Invoke `documentation-agent` with the full retro
   content to:
   - Complete `docs/learning/sprint-NN.md`: summary, metrics table, escaped defects and their
     lessons, actions, English vocabulary learned.
   - Create or update concept cards in `docs/learning/concepts/` for techniques used this sprint,
     each linking to the real PR/test/commit where it was applied.
   - Add a `docs/postmortems/` entry for any complex failure investigated this sprint if missing.
   - Update `docs/learning/glossary.md` (EN term, ES translation, one-line meaning).
     Commit on `docs/sprint-NN-retro`, open the PR, and have Antonio review and merge it.
