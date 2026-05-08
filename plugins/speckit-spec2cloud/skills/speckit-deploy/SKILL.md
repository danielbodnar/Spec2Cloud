---
name: speckit-deploy
description: Deploy the implemented feature to Azure once spec / plan / tasks / implement are complete.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = deployment guidance: override the AZD environment from `/azure.md`, or `--what-if` for a dry run. Empty = "deploy to the AZD environment recorded in `/azure.md`".

1. **Load context.** Read `specs/feature.json` → `<feature_directory>`. Read `spec.md`, `plan.md`, `tasks.md`, `tasks.json`, and the workspace-root `/azure.md`. Stop if `tasks.*` is missing (run `/speckit-tasks`) or any task is still pending (run `/speckit-implement`; list the pending IDs). Stop immediately if `/azure.md` records `none` for the AZD template (no `azure.yaml` to deploy). Constitution non-negotiables are enforced upstream by `/speckit-plan` and `/speckit-implement` and are not re-checked here. Recommend running `/speckit-verify` first if it hasn't been run for the current implementation; proceed only with explicit user confirmation.

2. **Confirm target.** Show the AZD environment, subscription, resource group, and region from `/azure.md` and **ASK** the user to confirm before any state-changing command.

3. **Prepare deployment.** Use ACR cloud build for container images - When a service ships as a container image, build it with `remoteBuild: true` in `azure.yaml`, instead of a local `docker build`. Removes the local Docker dependency and keeps builds reproducible across machines and CI.

4. **Deploy.** Sign in if needed (`azd auth login`), then run:

   ```bash
   azd up -e <AZD environment>
   ```

   Stream output. On failure, halt and report the failing resource + error + likely next step (template fix, quota, RBAC); do not retry blindly. Never pass destructive flags (e.g. `--force`) without explicit user opt-in in `$ARGUMENTS`. Never print or commit secrets — values must come from Key Vault / managed identity.

5. **Document.** Update documentation in `/docs`. Use the `azure-cost` skill to produce `/docs/azure-cost-estimation.md` with the cost estimate for the deployed environment.

6. **Report.** App URL/endpoint / Subscription / resource group / AZD environment, command run, resources created / updated / deleted, key outputs (IDs — no secrets), unresolved issues and follow-ups.
