---
description: Create the tasks needed for implementation and store them in tasks.md.
handoffs: 
  - label: Analyze For Consistency
    agent: speckit.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = additional guidance: scope hints, phases to skip, tasks to emphasize. Empty = derive tasks from the plan and spec as-is.

1. **Load context**. Read `.specify/feature.json` → `<feature_directory>`. Read `constitution.md`, `spec.md`, `plan.md`. Stop if `plan.md` missing (run `/speckit.plan`).

2. **Create dependency-ordered tasks** based on `.specify/presets/spec2cloud/templates/tasks-template.md`, written to **both** `<feature_directory>/tasks.md` (human-readable) and `<feature_directory>/tasks.json` (machine-readable), organized by phase:
   - **Setup** — project scaffolding, dependencies, tooling, cloud account/resource prerequisites.
   - **Foundational** — shared modules, data model, infrastructure, and contracts that other tasks depend on.
   - **User stories** (in priority order from the spec) — one group per story; each group ends with a verifiable outcome tied to a success criterion.
   - **Polish** — tests, docs, observability, deployment hardening, cleanup.

   Shared task rules: `TaskID` = `T###` zero-padded, sequential across the whole file, same IDs in both files; each task independently actionable and small enough to complete in one focused step (split anything larger); order so dependencies precede dependents and group parallelizable tasks under the same phase; reference concrete files and, where relevant, the spec requirement or success criterion the task satisfies; carry forward any `[NEEDS CLARIFICATION: <question>]` from spec/plan as `Resolve: <question>` tasks in **Setup** so they're addressed before implementation; don't write code or expand tasks into prose — that's `/speckit.implement`.

   `tasks.md` format: each task is `- [ ] [TaskID] Description with file path(s)`; `##` per phase, `###` per user story.

   `tasks.json` format — a single object:

   ```json
   {
     "feature_directory": "<feature_directory>",
     "phases": [
       {
         "name": "setup | foundational | user_story | polish",
         "story": "<story title, only for user_story phases>",
         "tasks": [
           {
             "id": "T001",
             "description": "<imperative description>",
             "files": ["<path>", "..."],
             "depends_on": ["T000", "..."],
             "parallel_with": ["T002", "..."],
             "satisfies": ["<requirement or success-criterion id>"],
             "status": "pending"
           }
         ]
       }
     ]
   }
   ```

   `status` always starts `"pending"`; `/speckit.implement` flips it to `"done"` (and the matching `- [ ]` to `- [x]` in `tasks.md`). Omit `depends_on` / `parallel_with` / `satisfies` when empty rather than emitting empty arrays. Keep `tasks.md` and `tasks.json` strictly in sync — same IDs, descriptions, order.

3. **Report**: paths to `<feature_directory>/tasks.md` and `tasks.json`, total task count per phase, any unresolved `[NEEDS CLARIFICATION]` items surfaced as tasks.
