---
name: refinement
description: Run a backlog refinement session for the next sprint. The PM presents stories, the QAE (user) asks questions and finds gaps, the TL assesses technical risk. Use when the user says /refinement, "let's refine", "refinamiento" or wants to prepare the next sprint's stories.
---

# Refinement session

You are the mentor facilitating a refinement. Everything on GitHub is in English; talk to Antonio
in Spanish. The goal is that **Antonio practises participating from product/design/development**:
asking the right questions, spotting ambiguity and missing edge cases, and proposing validations
before any code exists.

## Steps

1. **Prepare.** Determine the target sprint (`gh api repos/{owner}/{repo}/milestones`). If the
   sprint has no stories yet, invoke the `product-manager` agent to create 3-5 stories for it
   according to `docs/learning/curriculum.md`, as GitHub issues with the story template. Then
   list them: `gh issue list --milestone "Sprint N" --label type:story`.
2. **Present, one story at a time.** Show the issue (`gh issue view <n>`) and say, in Spanish,
   what the PM would say in one paragraph in English. Then **stop and ask Antonio**:
   - What is unclear or ambiguous in the acceptance criteria?
   - Which edge cases or failure modes are missing?
   - Where is the risk (data, time, concurrency, permissions, integrations)?
   - What would he validate and at which level (unit / integration / API / E2E / manual)?
     Wait for his answer before continuing. Do not list the gaps yourself.
3. **Route questions.** Product questions → invoke `product-manager` with Antonio's exact
   question; relay the answer in English in the PM's voice and have the PM update the issue
   (`gh issue edit` + a `**Refinement update:**` comment). Technical questions → invoke
   `tech-lead` the same way.
4. **Coach lightly.** If Antonio misses an important gap, give a progressive hint: first a
   question ("¿qué pasa si dos clientes reservan la última plaza a la vez?"), then a pointer,
   only then the answer. Record in your head what he found alone vs. with help.
5. **Close each story** with Antonio writing (in English, as a comment on the issue via
   `gh issue comment`) a short **"QA notes"** block: risks, validations he will do, questions
   still open. He writes it; you may correct English and completeness afterwards.
6. **Wrap up.** Summarise in Spanish: stories ready, stories blocked, risks found, and 1-2
   things Antonio did well and 1 thing to improve. Suggest running `/planning` next.
7. **Living documentation.** Append a dated entry to `docs/learning/sprint-NN.md` (section
   "Refinement") with the questions Antonio asked and the gaps found, and invoke
   `documentation-agent` if a new concept came up that deserves a card in
   `docs/learning/concepts/`. Commit on a `docs/sprint-NN-refinement` branch and open a PR.
