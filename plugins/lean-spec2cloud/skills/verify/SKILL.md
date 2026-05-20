---
name: verify
description: Use when implementation exists and needs to be exercised locally against provisioned Azure dependencies, before deploying.
---

# Verify Skill

Requires `spec.md`. If `plan.md` is missing, auto-run `plan`. If `implementation.md` is missing, run `implement` first. If `./src/` is missing, return to Implement. Load workspace context per `copilot-instructions.md`.

## Execute

- Provision Azure dependencies with `azd provision` and wait for completion:
  ```bash
  azd provision -e <AZD environment>
  ```
- Wire local config (`.env`, `local.settings.json`, `appsettings.Development.json`, …) using `azd env get-values -e <AZD environment>`. Show the user which keys are written (names only). Secrets must resolve via Key Vault references / managed identity — never as literals.
- Start local servers (frontends, backends, MCP servers, Foundry hosted agents) with hot reload and telemetry enabled, run automated tests, update `./docs/verify.md` with process, results, and manual test instructions. On resume, re-read `./docs/verify.md` and re-run only the checks not yet marked passed.
  - If Docker is running, ask the user whether to start the local servers in Docker containers; otherwise, start the processes locally.
  - If Aspire is requested by the user, ensure the Aspire AppHost orchestrating agent is created, the Aspire run profiles are configured, and the AppHost is running (`dotnet run apphost.cs`).
- Report to the user the local URL's so that he can verify the end-to-end functionality.

**Pause if:** provisioning fails, a local component fails to start, or a test fails — report and wait, do not retry blindly.

## Report

Do not claim verification passed without ensuring that the local servers started successfully in this turn and reporting exit code + key output. Summarize the updated `./docs/verify.md`.

