---
name: implement
description: Execute pending tasks from tasks.md / tasks.json, updating both on completion.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = execution guidance: a `T###` to start at or stop after, a phase to limit to, a task to skip. Empty = execute all pending tasks in order.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `constitution.md`, `spec.md`, `plan.md`, `tasks.md`, `tasks.json`. Run `/speckit:tasks` automatically first, if `tasks.md`/`tasks.json` are missing. If they disagree (IDs, descriptions, order), stop and report divergence — do not silently pick one. Resolve any `Resolve: <question>` setup tasks with the user; do not guess.

2. **Initialize the AZD template and set environment variables**:

    1. Create a fresh temp directory **outside the workspace** in the OS temp area, then change into it. Pick the variant for the host shell — do **not** create `<tmp>` inside the workspace and do **not** run `git init` in it.

        - PowerShell (Windows / cross-platform `pwsh`):

          ```powershell
          $tmp = Join-Path ([System.IO.Path]::GetTempPath()) "azd-init-<feature-name>-$([guid]::NewGuid().ToString('N').Substring(0,8))"
          New-Item -ItemType Directory -Path $tmp | Out-Null
          Push-Location $tmp
          ```

        - bash / zsh (macOS / Linux):

          ```bash
          tmp="$(mktemp -d -t azd-init-<feature-name>-XXXXXX)"
          pushd "$tmp" > /dev/null
          ```

    2. From inside `<tmp>`, run **one** of the following based on the value recorded in `/azure.md`:

        - When an AZD template was selected:

          ```bash
          azd init -t <AZD template> -e <AZD environment> -s <Azure Subscription Id> -l <Azure Region>
          ```

        - When the user chose a minimal scaffold (recorded as `minimal` in `azure.md`):

          ```bash
          azd init --minimal -e <AZD environment> -s <Azure Subscription Id> -l <Azure Region>
          ```

        Treat a non-zero exit as a real failure **only if the expected outputs (`azure.yaml`, `.azure/`, and — for non-minimal — `infra/`) are missing** from `<tmp>`. Messages like `pathspec '*' did not match any files` from azd's internal git stage step are benign once the files are on disk; log them and continue.

    3. Move `azure.yaml`, `.azure/`, `infra/`, and any `.gitignore` from `<tmp>` to the workspace root. For each path that already exists at the destination, **ASK** the user whether to overwrite, skip, or keep both (rename the incoming file). Never silently overwrite. For `.gitignore`, prefer **merge** (append missing lines) over overwrite. Use `Move-Item` on PowerShell and `mv` on bash/zsh; both honor case-sensitive paths on macOS/Linux.
    4. Return to the workspace root and delete `<tmp>` recursively:

        - PowerShell: `Pop-Location; Remove-Item -Recurse -Force $tmp`
        - bash / zsh: `popd > /dev/null && rm -rf "$tmp"`

    Then persist the AZD environment variables. `/azure.md` must be fully resolved at this point — if any `[NEEDS CLARIFICATION: populate via <skill-name>]` marker remains, execute the skill and resolve the value. Always set `AZURE_RESOURCE_GROUP` first (using the resource group recorded in `/azure.md`), then iterate over every other variable defined in `/azure.md` and run:

    ```bash
    azd env set -e <AZD environment> <variable-name> <variable-value>
    ```

    Do not proceed to step 4 until every variable has been successfully persisted via `azd env set`.

3. **Execute pending tasks** in order, honoring `depends_on` and `$ARGUMENTS` scope. Skip tasks already `- [x]` / `"status": "done"`. For each task: make the smallest change that satisfies its description + `satisfies` references; honor non-negotiable rules from the constitution (halt + report if a task would violate one); on success, mark complete in **both** files — flip `- [ ]` → `- [x]` in `tasks.md` and set `"status": "done"` in `tasks.json` for the matching `id`; on failure, leave pending, halt execution, and report task ID + error + suggested next step (do not move on to dependents). Tasks listed in each other's `parallel_with` have no ordering constraint between them, but still execute one at a time and update both files after each.

4. **Validate**. Confirm every non-skipped task is `- [x]` in `tasks.md` and `"status": "done"` in `tasks.json`. Spot-check that the implementation satisfies the spec's functional requirements + success criteria and that no `[NEEDS CLARIFICATION]` markers remain. Run project-defined verification (local tests that doesn't depend on Azure, linters, build) if available; report results but don't fix unrelated pre-existing failures.

5. **Report**: path to `<feature_directory>/tasks.md`, completed task count, any halted/failed task with its error, remaining pending tasks, one-line summary of what was implemented.
