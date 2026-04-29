---
description: Execute the implementation plan by processing all tasks in tasks.md.
handoffs:
  - label: Verify Locally
    agent: speckit.verify
    prompt: Run the implemented feature locally to verify it works before deploying to Azure
    send: true
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = execution guidance: a `T###` to start at or stop after, a phase to limit to, a task to skip. Empty = execute all pending tasks in order.

1. **Load context**. Read `.specify/feature.json` → `<feature_directory>`. Read `constitution.md`, `spec.md`, `plan.md`, `tasks.md`, `tasks.json`. Stop if `tasks.md`/`tasks.json` missing (run `/speckit.tasks`). If they disagree (IDs, descriptions, order), stop and report divergence — do not silently pick one. Resolve any `Resolve: <question>` setup tasks with the user; do not guess.

2. **Execute pending tasks** in order, honoring `depends_on` and `$ARGUMENTS` scope. Skip tasks already `- [x]` / `"status": "done"`. For each task: make the smallest change that satisfies its description + `satisfies` references; honor non-negotiable rules from the constitution (halt + report if a task would violate one); on success, mark complete in **both** files — flip `- [ ]` → `- [x]` in `tasks.md` and set `"status": "done"` in `tasks.json` for the matching `id`; on failure, leave pending, halt execution, and report task ID + error + suggested next step (do not move on to dependents). Tasks listed in each other's `parallel_with` have no ordering constraint between them, but still execute one at a time and update both files after each.

3. **Validate**. Confirm every non-skipped task is `- [x]` in `tasks.md` and `"status": "done"` in `tasks.json`. Spot-check that the implementation satisfies the spec's functional requirements + success criteria and that no `[NEEDS CLARIFICATION]` markers remain. Run project-defined verification (tests, linters, build) if available; report results but don't fix unrelated pre-existing failures.

4. **Report**: path to `<feature_directory>/tasks.md`, completed task count, any halted/failed task with its error, remaining pending tasks, one-line summary of what was implemented.
