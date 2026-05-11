---
name: deploy
description: Deploy the implemented feature to Azure once spec / plan / tasks / implement are complete.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = deployment guidance: override the AZD environment from `/azure.md`, or `--what-if` for a dry run. Empty = "deploy to the AZD environment recorded in `/azure.md`".

1. **Load context.** Read `specs/feature.json` → `<feature_directory>`. Read `spec.md`, `plan.md`, `tasks.md`, `tasks.json`, and the workspace-root `/azure.md`. Stop if `tasks.*` is missing (run `/speckit:tasks`) or any task is still pending (run `/speckit:implement`; list the pending IDs). Stop immediately if `/azure.md` records `none` for the AZD template (no `azure.yaml` to deploy). Constitution non-negotiables are enforced upstream by `/speckit:plan` and `/speckit:implement` and are not re-checked here. Recommend running `/speckit:verify` first if it hasn't been run for the current implementation; proceed only with explicit user confirmation.

2. **Tear down — only what you started.** Offer to stop the local processes you started; never stop anything you didn't.

3. **Confirm target.** Show the AZD environment, subscription, resource group, and region from `/azure.md` and **ASK** the user to confirm before any state-changing command.

4. **Prepare deployment.** Use ACR cloud build for container images - When a service ships as a container image, build it with `remoteBuild: true` in `azure.yaml`, instead of a local `docker build`. Removes the local Docker dependency and keeps builds reproducible across machines and CI.

5. **Deploy.** Sign in if needed (`azd auth login`), then run:

   ```bash
   azd up -e <AZD environment> --debug > ./azure.log
   ```

   Stream output. On failure, halt and report the failing resource + error + likely next step (template fix, quota, RBAC); do not retry blindly. Never pass destructive flags (e.g. `--force`) without explicit user opt-in in `$ARGUMENTS`. Never print or commit secrets — values must come from Key Vault / managed identity.

6. **Update status.** Create or update `<feature_directory>/deploy-status.json` with the result of this deployment run. Overwrite the file atomically — do not append — and never write secrets (connection strings, keys, SAS tokens, passwords). Use ISO-8601 UTC timestamps (`YYYY-MM-DDTHH:MM:SSZ`). Use this exact schema:

   ```json
   {
     "feature": "<feature_directory relative path>",
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
     "command": "azd up -e dev --debug",
     "log_file": "./azure.log",
     "endpoints": [
       { "name": "web", "url": "https://web-abc123.azurewebsites.net" },
       { "name": "api", "url": "https://api-abc123.azurewebsites.net" }
     ],
     "resources": [
       { "name": "app-web-abc123", "type": "Microsoft.Web/sites", "action": "created" },
       { "name": "cosmos-abc123",  "type": "Microsoft.DocumentDB/databaseAccounts", "action": "updated" }
     ],
     "outputs": {
       "AZURE_RESOURCE_GROUP": "rg-myfeature",
       "WEB_URI": "https://web-abc123.azurewebsites.net"
     },
     "error": null
   }
   ```

   Field rules: `status` is `succeeded` when `azd up` exits 0, `failed` when it exits non-zero (populate `error` with `{ "resource": "...", "code": "...", "message": "..." }`), `partial` when some resources deployed but the run halted, `what-if` when `--what-if` was passed (no resources actually changed). `resources[].action` is one of `created` / `updated` / `deleted` / `unchanged`. `outputs` contains the non-secret keys returned by `azd env get-values` — strip any value whose key matches `*KEY*`, `*SECRET*`, `*PASSWORD*`, `*CONNECTION_STRING*`, or `*TOKEN*`.

7. **Document.** Update documentation in `/docs`. If the `azure-cost` skill exists, use it to produce `/docs/azure-cost-estimation.md` with the cost estimate for the deployed environment.

8. **Report.** App URL/endpoint / Subscription / resource group / AZD environment, command run, resources created / updated / deleted, key outputs (IDs — no secrets), unresolved issues and follow-ups.
