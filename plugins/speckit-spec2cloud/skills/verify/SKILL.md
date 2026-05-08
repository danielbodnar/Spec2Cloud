---
name: verify
description: Run the implemented feature on local servers (provisioning Azure-only dependencies first) to verify it works before deploying to Azure.
---

## User Input

```text
$ARGUMENTS
```

## Outline

**Purpose.** Provision the feature's Azure dependencies via `azd provision`, then run the components locally pointed at those Azure resources so the user can exercise the feature end-to-end. A green run gates `/speckit:deploy`; failure blocks it.

`$ARGUMENTS` (if any) = guidance: which component to focus on (`api` / `web` / `functions` / `worker`), `--reuse` (skip `azd provision` if the env is already provisioned), `--rerun` (force fresh start of local processes). Empty = "provision Azure deps for the AZD env in `/azure.md`, start the feature locally against them, and walk me through verifying it works".

> **Context.** `/speckit:implement` already ran the unit/integration suite. This command runs the feature so the user can exercise it like a real consumer.

1. **Load context.** Read `specs/feature.json` → `<feature_directory>`. Read `spec.md`, `plan.md`, `tasks.md`, `tasks.json`, and the workspace-root `/azure.md`. Stop if `tasks.*` is missing (run `/speckit:tasks`). If any task is still pending, list the IDs and **ASK** whether to verify the partial implementation or stop. Constitution non-negotiables are enforced upstream by `/speckit:plan` and `/speckit:implement` and are not re-checked here.

2. **Inventory.** From `plan.md`, `azure.yaml`, and the repo, list each runnable component (path, run command — `dotnet run` / `npm run dev` / `func start` / `uvicorn …`, port, health URL) and the Azure resources it depends on. Show the inventory as a table and **ASK** the user to confirm before proceeding.

3. **Provision Azure dependencies.** Confirm the AZD environment, subscription, resource group, and region recorded in `/azure.md`, then run:

   ```bash
   azd provision -e <AZD environment>
   ```

   - With `--reuse`, first check `azd show -e <AZD environment> -o json` (falling back to `az group show -n <resource-group>` if `azd show` does not report provisioning state); if the environment’s resources already exist, skip this step and reuse them.
   - On failure, surface the error and stop — do not start anything locally against a half-provisioned environment.

4. **Wire local config to the provisioned resources.** Export the AZD environment values into the local config the components read (`.env`, `local.settings.json`, `appsettings.Development.json`, etc.) using `azd env get-values -e <AZD environment>`. Show the user which keys are being written (names only, never secret values). Secrets must resolve via Key Vault references / managed identity — never as literals.

5. **Pre-flight.** Verify the required tools are installed (`dotnet`, `node`, `python`, …). **ASK** before installing anything. Restore dependencies (`npm ci`, `dotnet restore`, `pip install -e .`, …) — also after asking.

6. **Start the components locally.** In dependency order, start each component. Detect busy ports and **ASK** whether to reuse, kill, or pick another — never silently override. Show the frontend (if available) in the integrated browser.

7. **Tear down — only what you started.** Offer to stop the local processes you started; never stop anything you didn't. Leave the Azure resources running by default (expensive to recreate); tell the user how to delete them with `azd down -e <AZD environment> --purge` and warn about cost for non-trivial resources (Foundry, AI Search, AKS).

8. **Hand off.** Emit a clear **go / no-go** for `/speckit:deploy` plus a short report:
   - Azure resources provisioned / reused (subscription, resource group, names, endpoints — no secrets).
   - Local processes (component → URL → PID → log file).
   - Per-scenario result, with evidence for failures.
   - Anything still unverified and why.
   - Exact next step: `/speckit:deploy` if all green, otherwise specific fixes.
