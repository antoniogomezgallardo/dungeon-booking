---
name: standup
description: Daily standup-style status of the sprint and today's focus for the QAE. Use when the user says /standup, "daily", "¿qué hago hoy?" or "¿cómo va el sprint?".
---

# Standup

Give Antonio, in Spanish, a short status and a concrete focus for today. Keep it under 20 lines.

1. Gather facts (do not guess):
   - `gh issue list --milestone "<current sprint>" --state all` (stories, bugs, who is blocked)
   - `gh pr list --state open` and `gh pr checks <n>` for CI status
   - `git log --oneline -10 main`, `git branch -a`
   - Open items in `docs/learning/sprint-NN.md` "Actions" section, if any.
2. Report in three blocks, team-style: **Yesterday / Today / Blockers**, where "team" means the
   simulated squad: what the dev merged or opened, what the TL reviewed, what the QAE did.
3. **Today's focus for Antonio**: one primary task and one secondary, tied to the sprint's
   learning goal in `docs/learning/curriculum.md`. Examples: "review PR #12's diff and write the
   API tests for the 409 path", "reproduce the flaky E2E and open a postmortem".
4. If a PR is waiting for QA validation (`status:needs-qa`) for more than a day of the sprint,
   call it out as the top priority: quality feedback loops should be short.
5. If the dev is idle (no open PR and stories remain), invoke `senior-developer` to pick the
   next story, then tell Antonio.
