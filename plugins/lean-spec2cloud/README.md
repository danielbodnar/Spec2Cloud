# lean-spec2cloud (copilot plugin)

A lean, opinionated copilot plugin for shipping features to Azure. Five skills, one loop:

**specify → plan → implement → verify → deploy**

Plus a `spec2cloud` orchestrator that runs the whole loop end-to-end from a single prompt.

## How it works

Each skill is a focused step that reads/writes a single doc under `./docs/` and (when relevant) `./.azure/`:

| Skill | Trigger | Inputs | Outputs |
|-------|---------|--------|---------|
| [specify](./skills/specify/SKILL.md) | Starting or refining requirements | User prompt | `./docs/spec.md`, `.github/copilot-instructions.md` |
| [plan](./skills/plan/SKILL.md) | Spec exists, need design + AZD template choice | `spec.md` | `./docs/plan.md`, `./.azure/deployment-plan.md` |
| [implement](./skills/implement/SKILL.md) | Plan exists, need code + IaC | `spec.md`, `plan.md` | `./src/`, `./infra/`, `azure.yaml` |
| [verify](./skills/verify/SKILL.md) | Implementation ready, exercise locally | `plan.md`, `./src/` | `./docs/verify.md`, provisioned Azure deps |
| [deploy](./skills/deploy/SKILL.md) | Local verification passed | All of the above | Deployed Azure endpoint, `./docs/deploy.md` |
| [spec2cloud](./skills/spec2cloud/SKILL.md) | Run the full loop autonomously | User prompt | All of the above |

Skills auto-chain: `implement` will run `plan` if missing; `verify` will run `implement`; `deploy` requires verify. Each pauses on genuine ambiguity rather than guessing.

## Install

Add the Spec2Cloud marketplace (or update it if already added):

```bash
copilot plugin marketplace add Azure-Samples/Spec2Cloud
# or, to update:
copilot plugin marketplace update Spec2Cloud
```

Then install the plugin (or update it):

```bash
copilot plugin install lean@Spec2Cloud
# or, to update:
copilot plugin update lean@Spec2Cloud
```

Prerequisites for `verify` / `deploy`: `az`, `azd`, and `bicep` CLIs installed; `azd auth login` completed.

## Examples

### One-shot: prompt → deployed endpoint

```
copilot -p "/fleet lean:spec2cloud Build a simple stateless AI chat application that allows users to interact with a large language model, using React + Vite with a component library for the frontend and Python with the Microsoft Agent Framework for the backend API, with no data persistence. Deploy both the frontend and backend as Azure Container Apps, host the models on Microsoft Foundry, and enable monitoring. Authentication and private networking are out of scope." --no-ask-user --yolo
```

Runs all five stages, records assumptions, and returns the deployed URL.

copilot -p "/fleet lean:spec2cloud Build a todo web app with a C# backend deployed on App Service, using Cosmos DB for NoSQL as the data persistence layer." --no-ask-user --yolo

### Step-by-step

```
/lean:specify Build a todo web app with a C# backend deployed on App Service, using Cosmos DB for NoSQL as the data persistence layer.
/lean:plan
/lean:implement
/lean:verify
/lean:deploy
```

### Reverse-engineer a spec from existing code

```
/lean:specify reverse
```

Generates `./docs/spec.md` from current `./src/` and `./infra/`.

### Sync the spec with recent chat decisions

```
/lean:specify sync
```

### Validate implementation against spec

```
/lean:specify validate
```

## Related

- [`speckit-spec2cloud`](../speckit-spec2cloud/README.md) — full spec-kit variant (10 skills: constitution, clarify, tasks, analyze, checklist, …) for heavier workflows.
