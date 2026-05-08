---
name: tasks
description: Create tasks.md and tasks.json (dependency-ordered, phase-grouped) from plan and spec.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = additional guidance: scope hints, phases to skip, tasks to emphasize. Empty = derive tasks from the plan and spec as-is.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `constitution.md`, `spec.md`, `plan.md`. Stop if `plan.md` missing (run `/speckit:plan`).

2. **Create dependency-ordered tasks** based on `assets/tasks-template.md`, written to **both** `<feature_directory>/tasks.md` (human-readable) and `<feature_directory>/tasks.json` (machine-readable), organized by phase:
   - **Setup** — project scaffolding, dependencies and tooling.
   - **Foundational** — shared modules, data model, and contracts that other tasks depend on.
   - **User stories** (in priority order from the spec) — one coarse-grained task (or a small handful) per story that delivers the story end-to-end. Do not break stories into per-test or per-acceptance-criterion subtasks.
   - **Validate infrastructure** — confirm the Azure deployment is sound without provisioning anything: `azd package --all` (build & package every service) followed by `azd provision --preview -e <AZD environment>`. Fix any output errors.
   - **Set environment variables** - export the AZD environment values into the local config the components read (`.env`, `local.settings.json`, `appsettings.Development.json`, etc.) using `azd env get-values -e <AZD environment>`. Use the keys that the code expects. Secrets must resolve via Key Vault references / managed identity — never as literals.
   - **Document** — produce documentation in the `/docs` folder: architecture and local-dev.

   Shared task rules: `TaskID` = `T###` zero-padded, sequential across the whole file, same IDs in both files; prefer **coarse-grained, outcome-oriented tasks** over fine-grained checklists — only split a task when two pieces have genuinely different files or dependencies; do **not** create separate tasks for writing tests or for verifying acceptance criteria; order so dependencies precede dependents and group parallelizable tasks under the same phase; reference concrete files; carry forward any `[NEEDS CLARIFICATION: <question>]` from spec/plan as `Resolve: <question>` tasks in **Setup** so they're addressed before implementation; don't write code or expand tasks into prose — that's `/speckit:implement`.

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

   `status` always starts `"pending"`; `/speckit:implement` flips it to `"done"` (and the matching `- [ ]` to `- [x]` in `tasks.md`). Omit `depends_on` / `parallel_with` / `satisfies` when empty rather than emitting empty arrays. Keep `tasks.md` and `tasks.json` strictly in sync — same IDs, descriptions, order.

3. **Report**: paths to `<feature_directory>/tasks.md` and `tasks.json`, total task count per phase, any unresolved `[NEEDS CLARIFICATION]` items surfaced as tasks.
