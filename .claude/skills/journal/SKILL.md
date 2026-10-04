---
name: journal
description: Capture a learning moment into the living documentation right away (a technique learned, a debugging path, a mistake, an English phrase) without waiting for the retro. Use when the user says /journal, "apunta esto", "documenta lo que acabamos de aprender" or after a notable debugging session.
---

# Journal a learning moment

Talk to Antonio in Spanish; write the documentation in English.

1. Ask (or infer from the last exchanges) **what** was learned and **where** it happened (PR,
   test file, commit, log). Verify the reference exists before writing it down.
2. Decide the destination:
   - A short dated entry in `docs/learning/sprint-NN.md` under "Journal" (always).
   - A concept card in `docs/learning/concepts/<slug>.md` if the topic is a reusable technique.
     Card structure: **Problem** we hit → **Concept** explained for someone who has never seen
     it → **How we applied it here** (links to real code) → **Pitfalls** → **Further reading**.
   - A `docs/postmortems/YYYY-MM-DD-<slug>.md` if it was a non-trivial failure investigation:
     Symptoms → Timeline → Hypotheses tried (including wrong ones) → Diagnosis path → Root cause
     → Fix → Lessons → Prevention.
   - A glossary line in `docs/learning/glossary.md` for new vocabulary (EN / ES / meaning).
3. Invoke `documentation-agent` with the gathered facts to write it (pedagogical, verified,
   Diátaxis-consistent). Keep each piece short; link instead of repeating.
4. Commit on `docs/journal-<slug>` with Antonio as author if he dictated the content, open a PR
   to `main`. Tell Antonio where it landed.
