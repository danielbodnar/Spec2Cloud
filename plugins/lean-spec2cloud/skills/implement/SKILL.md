---
name: implement
description: Use when a plan exists and the application source or IaC needs to be created or updated.
---

# Implement Skill

Requires `spec.md`. If `plan.md` is missing, auto-run `plan`. Load workspace context per `copilot-instructions.md`.

## Scaffold (if `./infra/` is missing)

In an OS temp dir (not the workspace), run **one** of:

```bash
azd init -t <AZD template> -e <AZD environment> -s <Azure Subscription Id> -l <Azure Region>
azd init --minimal -e <AZD environment> -s <Azure Subscription Id> -l <Azure Region>
```

Pick the form recorded in `./.azure/deployment-plan.md`. Treat non-zero exit as failure only if `azure.yaml` or (non-minimal) `infra/` are missing.

Move `azure.yaml` and `infra/` into the workspace root. **Ask** before overwriting; Delete the temp dir.

## Persist environment variables

`./.azure/deployment-plan.md` must have no `[NEEDS CLARIFICATION: …]` markers. Run `azd env set` for `AZURE_RESOURCE_GROUP` first, then for every other variable in the deployment plan.

## Execute

Implement per `./docs/plan.md`, keeping it updated with progress. On resume, re-read `./docs/plan.md` and continue from the next unchecked step.

Create or update `./docs/implementation.md` to capture the architecture that was actually built and the key implementation details (components, data flow, key decisions, deviations from `plan.md`). Include one or more animated Mermaid `flowchart` diagrams to visualize the runtime architecture and request/data flow.

**Pause if:** a task is unclear, implementation reveals a spec/plan gap, or any error/blocker is hit — report and wait, do not guess.

## Post-implementation checks

Check the following and fix any gaps before claiming implementation is complete and ready for verify/deploy:

- Check if `./azure.yaml` has service configuration (`host: azure.ai.agent`) for each implemented agent.
- Check if `./azure.yaml` has service configuration for each MCP server.
- Check if `./azure.yaml` has service configuration for the frontend.
- Check if `./azure.yaml` has service configuration for the backend.
- Check if `./azure.yaml` has services configured with cloud build (`remoteBuild: true`) set for container images. Use docker if the user prefers local build and it's running; otherwise, use ACR cloud build.
- Check if CORS is configured between frontend and backend for both local and cloud environment (`./infra`).

## Report

Summarize the updated `./docs/implementation.md`.

