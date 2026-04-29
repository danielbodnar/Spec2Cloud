---
description: Create or update the project constitution.
handoffs: 
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` is the user's input from the triggering message — assume it's available even if the placeholder appears literally above. Don't ask the user to repeat it unless they provided an empty command.

1. **Gather context**. Read `.specify/memory/constitution.md` if it exists (this is an update, not a fresh write). Skim repo context — `README.md`, top-level docs, project metadata (`pyproject.toml`, `package.json`, etc.) — to ground the constitution in reality.

2. **Create if missing**. `.specify/memory/constitution.md` should be initialized from `.specify/presets/spec2cloud/templates/constitution-template.md` during project setup. If it's missing, copy the template first.

3. **Update** `.specify/memory/constitution.md` with these sections:
   - **Project name & purpose** — one-line identity + the problem it solves.
   - **Guiding principles** — 3–7 short, opinionated principles that shape design and trade-offs.
   - **Non-negotiable rules** — hard constraints (security, compliance, compatibility, deployment targets) downstream specs/plans must respect.
   - **Out of scope** — things the project explicitly will *not* do, to prevent scope drift.

   Guidelines: merge user input with existing content, preserving prior rules unless explicitly overridden; keep it terse — every line should be actionable by `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`; mark genuine unknowns as `[NEEDS CLARIFICATION: <question>]` rather than inventing constraints; no implementation details, file structures, or task lists — those belong in `plan.md` and `tasks.md`.

4. **Report** the path to `.specify/memory/constitution.md` and a brief summary of what changed (or "created" if new).
