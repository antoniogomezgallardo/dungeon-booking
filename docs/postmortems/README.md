# Postmortems

One blameless write-up per complex failure investigated, named `YYYY-MM-DD-<slug>.md`.
The most valuable part is the **diagnosis path**, including hypotheses that turned out wrong.

Template:

```markdown
# <Title>

- Date:
- Environment:
- Severity:
- Author: Antonio (QAE)

## Symptoms

## Timeline

## Hypotheses tried (including the wrong ones)

## Diagnosis path (what was looked at, in order, and what each step revealed)

## Root cause

## Fix (link to PR)

## Lessons

## Prevention (test added, alert, process change)
```

| Date       | Title                                                                                                          | Severity |
| ---------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| 2026-10-04 | [Staging deployment failed: API container never became healthy](2026-10-04-staging-api-container-unhealthy.md) | S2       |
