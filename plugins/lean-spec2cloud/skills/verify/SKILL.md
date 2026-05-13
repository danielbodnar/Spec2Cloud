---
name: verify
description: Use when implementation exists and needs to be exercised locally against provisioned Azure dependencies, before deploying.
---

# Verify Skill

Requires `spec.md`. If `plan.md` is missing, auto-run `plan`. If `implementation.md` is missing, run `implement` first. If `./src/` is missing, return to Implement. Load workspace context per `copilot-instructions.md`.

## Execute

- Provision Azure dependencies if required. With `--reuse`, first check `azd show -e <AZD environment> -o json` (or `az group show -n <resource-group>`) and skip provisioning if the resources already exist:
  ```bash
  azd provision -e <AZD environment> --debug > ./azure.log
  ```
- Wire local config (`.env`, `local.settings.json`, `appsettings.Development.json`, …) using `azd env get-values -e <AZD environment>`. Show the user which keys are written (names only). Secrets must resolve via Key Vault references / managed identity — never as literals.
- Start local servers, run automated tests, update `./docs/verify.md` with process, results, and manual test instructions. On resume, re-read `./docs/verify.md` and re-run only the checks not yet marked passed.
- Hand back a local test interface for the user.

**Pause if:** provisioning fails, a local component fails to start, or a test fails — report and wait, do not retry blindly.

## Report

Do not claim verification passed without running the test command in this turn and reporting exit code + key output. Summarize the updated `./docs/verify.md`.

