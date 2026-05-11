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
   azd provision -e <AZD environment> --debug > ./azure.log
   ```

   - With `--reuse`, first check `azd show -e <AZD environment> -o json` (falling back to `az group show -n <resource-group>` if `azd show` does not report provisioning state); if the environment’s resources already exist, skip this step and reuse them.
   - On failure, surface the error and stop — do not start anything locally against a half-provisioned environment.

4. **Wire local config to the provisioned resources.** Export the AZD environment values into the local config the components read (`.env`, `local.settings.json`, `appsettings.Development.json`, etc.) using `azd env get-values -e <AZD environment>`. Show the user which keys are being written (names only, never secret values). Secrets must resolve via Key Vault references / managed identity — never as literals.

5. **Pre-flight.** Verify the required tools are installed (`dotnet`, `node`, `python`, …). **ASK** before installing anything. Restore dependencies (`npm ci`, `dotnet restore`, `pip install -e .`, …) — also after asking.

6. **Start the components locally.** In dependency order, start each component. Detect busy ports and **ASK** whether to reuse, kill, or pick another — never silently override. Show the frontend (if available) in the integrated browser.

7. **Update status.** Create or update `<feature_directory>/verify-status.json` with the result of this verify run. Overwrite the file atomically — do not append — and never write secrets (connection strings, keys, SAS tokens, passwords). Use ISO-8601 UTC timestamps (`YYYY-MM-DDTHH:MM:SSZ`). `endpoints` lists the **local** addresses where each component is running on the developer's machine (the URLs the user opens to exercise the feature) — **not** the Azure-hosted URLs of the provisioned resources; the latter belong to `/speckit:deploy`'s `deploy-status.json`. Use this exact schema:

   ```json
   {
     "azd_environment": "<AZD environment>",
     "subscription_id": "<Azure Subscription Id>",
     "subscription_name": "<Azure Subscription Name>",
     "resource_group": "<resource group name>",
     "region": "<Azure region>",
     "azd_template": "<azd template repo or 'minimal'>",
     "status": "succeeded | failed | partial | what-if",
     "started_at": "2026-05-11T14:02:11Z",
     "completed_at": "2026-05-11T14:09:47Z",
     "duration_seconds": 456,
     "command": "azd provision -e dev --debug",
     "log_file": "./azure.log",
     "endpoints": [
       { "name": "web", "url": "http://localhost:5173" },
       { "name": "api", "url": "http://localhost:5000/health" }
     ],
     "resources": [
       { "name": "app-web-abc123", "type": "Microsoft.Web/sites", "action": "created" },
       { "name": "cosmos-abc123",  "type": "Microsoft.DocumentDB/databaseAccounts", "action": "updated" }
     ],
     "outputs": {
       "AZURE_RESOURCE_GROUP": "rg-myfeature"
     },
     "error": null
   }
   ```

   Field rules: `endpoints[].url` MUST be a local URL (typically `http://localhost:<port>` or `http://127.0.0.1:<port>`, optionally with the component's health path) — emit one entry per locally-started component from step 6, in the same order they were started; omit `endpoints` entirely when no component started. `status` is `succeeded` when `azd provision` exits 0 and every local component reached its health URL, `failed` when `azd provision` exits non-zero or any local component failed to start / become healthy (populate `error` with `{ "resource": "...", "code": "...", "message": "..." }`), `partial` when some resources / components came up but the run halted, `what-if` when `--what-if` was passed (no resources actually changed). `resources[].action` is one of `created` / `updated` / `deleted` / `unchanged`. `outputs` contains the non-secret keys returned by `azd env get-values` — strip any value whose key matches `*KEY*`, `*SECRET*`, `*PASSWORD*`, `*CONNECTION_STRING*`, or `*TOKEN*`.

8. **Hand off.** Emit a clear **go / no-go** for `/speckit:deploy` plus a short report:
   - Azure resources provisioned / reused (subscription, resource group, names, endpoints — no secrets).
   - Local processes (component → URL → PID → log file).
   - Per-scenario result, with evidence for failures.
   - Anything still unverified and why.
   - Exact next step: `/speckit:deploy` if all green, otherwise specific fixes.
