---
description: Create an implementation plan and store it in plan.md.
handoffs: 
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckit.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = additional planning guidance: constraints, preferences, tech choices to honor. Empty = plan from the spec as-is.

1. **Load context**. Read `.specify/feature.json` → `<feature_directory>`. Read `.specify/memory/constitution.md` (principles, non-negotiables, out-of-scope) and `<feature_directory>/spec.md` (source of truth for *what* and *why*). Stop if either is missing and name the command to run first (`/speckit.constitution` or `/speckit.specify`).

2. **Create the plan** based on `.specify/presets/spec2cloud/templates/plan-template.md`, stored in `<feature_directory>/plan.md` with these sections:
   - **Technical context** — language(s), runtime, key dependencies, target platform(s), external services (especially cloud/Azure).
   - **Architecture** — components and how they interact; brief diagram or component list.
   - **Project structure** — top-level directory layout and where new code will live.
   - **Design decisions** — each as *Decision → Rationale → Alternatives considered*. Cover data model, interfaces/contracts, cloud topology when relevant.
   - **Risks & open questions** — anything that could derail implementation, plus any `[NEEDS CLARIFICATION: <question>]` markers carried over from the spec or newly discovered.

   Guidelines: honor every constitution non-negotiable — if user request conflicts, surface it explicitly rather than silently overriding; make informed defaults, marking genuine unknowns as `[NEEDS CLARIFICATION: <question>]` instead of guessing; focus on *how* — *what*/*why* belong in `spec.md`, don't restate it; don't enumerate individual tasks or write code (that's `/speckit.tasks` and `/speckit.implement`).

3. **Report**: path to `<feature_directory>/plan.md`, one-line summary of the chosen approach, any unresolved `[NEEDS CLARIFICATION]` items.
