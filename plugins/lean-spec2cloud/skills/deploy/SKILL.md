---
name: deploy
description: Use when local verification passed and the feature is ready to ship to Azure.
---

# Deploy Skill

Requires `spec.md`, `plan.md`, `.azure/deployment-plan.md`, `verify.md`. If `spec.md` is missing, auto-run `specify` with the user's prompt, then auto-run `plan` and `implement`. If `plan.md` is missing, auto-run `plan` and `implement`. If `implementation.md` is missing, auto-run `implement` first. Load workspace context per `copilot-instructions.md`.

## Execute

**Preflight:** `az --version`, `azd version`, and `bicep --version` all succeed; `azd auth login --check-status` succeeds; `azd env list` shows the target env; `azure.yaml` exists and `infra/main.bicep` is present (skip if AZD template = `none`).

- Confirm AZD environment, subscription, resource group, and region from `.azure/deployment-plan.md` before any state-changing command. Stop if the deployment plan records `none` for the AZD template (no `azure.yaml` to deploy).
- Make sure that instrumentation is enabled, so that telemetry is available immediately after deployment.
- For IaC changes, dry-run with `azd provision --preview` before `azd deploy`.
- Never print or commit secrets; values must resolve via Key Vault / managed identity.
- Stop local servers before deploying to avoid file locks.
- Deploy:
  - If `azd provision` was succeeded, now perform the `azd deploy` and wait for completion:
    ```
    azd deploy -e <AZD environment>
    ```
  - If `azd provision` was not previously run, run `azd up` instead to provision and deploy in one step:
    ```
    azd up -e <AZD environment>
    ```
- After deployment succeeds, gather the deployed endpoint URLs from `azd show -e <AZD environment> -o json`.

### Common failures

| Symptom | Fix |
|---|---|
| `QuotaExceeded` | Change region or request quota increase |
| `ConflictError` (name taken) | Change `environmentName` or RG suffix |
| `ImagePullBackOff` | Verify ACR push + AcrPull RBAC |
| `InvalidTemplate` | Validate `infra/main.bicep` |
| `AuthorizationFailed` | Verify subscription + RBAC roles |

## Report

Do not claim deployment succeeded without `azd deploy` exit 0 AND the local E2E suite re-run against the deployed URL. Hand back the deployed Azure endpoint and summarize the updated `./docs/deploy.md`. Generate or refresh root `README.md` linking to `./docs/spec.md`, `./docs/plan.md`, `./docs/implementation.md`, `./docs/verify.md`, and `./docs/deploy.md`.
