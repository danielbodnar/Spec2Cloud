# Spec Kit Components

Spec2Cloud ships three [GitHub Spec Kit](https://github.com/github/spec-kit) artifacts that turn the generic spec-driven workflow into one optimized for shipping features to **Azure**:

| Artifact | Source | What it provides |
|---|---|---|
| **Preset** — [`presets/spec2cloud`](presets/spec2cloud) | `preset.yml` | Azure-aware overrides for the core commands (`speckit.constitution`, `speckit.specify`, `speckit.clarify`, `speckit.plan`, `speckit.tasks`, `speckit.implement`, `speckit.checklist`, `speckit.analyze`) and templates. |
| **Extension** — [`extensions/spec2cloud`](extensions/spec2cloud) | `extension.yml` | Two new commands: `speckit.verify` (run locally; provision Azure-only deps first) and `speckit.deploy` (azd / Bicep / Terraform). |
| **Workflow** — [`workflows/spec2cloud`](workflows/spec2cloud) | `workflow.yml` | Orchestrates the full cycle with a review gate at every artifact handoff. |

## Workflow

```
constitution → specify → (clarify) → plan → (checklist · analyze) → tasks → implement → verify → deploy
```

`constitution`, `specify`, `clarify`, `plan`, `tasks`, `implement`, `checklist`, `analyze` come from the **preset**. `verify` and `deploy` come from the **extension**. The **workflow** wires them together.

## Prerequisites

- The `specify` CLI from [`github/spec-kit`](https://github.com/github/spec-kit) (≥ 0.7.2 for the workflow, ≥ 0.6.0 for the preset, ≥ 0.2.0 for the extension).
- A coding agent that runs Spec Kit commands (e.g. GitHub Copilot in VS Code, GitHub Copilot CLI).
- For `speckit.verify` / `speckit.deploy`: [`az`](https://learn.microsoft.com/cli/azure/install-azure-cli) and (recommended) [`azd`](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd), authenticated against the target subscription.

## Install

Download the latest combined release: <https://github.com/Azure-Samples/Spec2Cloud/releases/latest> (tag pattern `spec-kit-spec2cloud-v*`). It contains three assets:

- `extension.zip` — extract into `.specify/extensions/spec2cloud/`
- `preset.zip` — extract into `.specify/presets/spec2cloud/`
- `workflow.yml` — copy to `.specify/workflows/spec2cloud/workflow.yml`

**Use the latest release:**

```shell
specify init . --integration copilot --integration-options="--skills"
specify preset add spec2cloud --from https://aka.ms/spec2cloud/spec-kit-preset
specify extension add spec2cloud --from https://aka.ms/spec2cloud/spec-kit-extension
specify workflow add https://aka.ms/spec2cloud/spec-kit-workflow
```

**Use a specific release:**

```shell
specify init . --integration copilot --integration-options="--skills"
specify preset add spec2cloud --from https://github.com/Azure-Samples/Spec2Cloud/releases/download/spec-kit-spec2cloud-v<VERSION>/preset.zip
specify extension add spec2cloud --from https://github.com/Azure-Samples/Spec2Cloud/releases/download/spec-kit-spec2cloud-v<VERSION>/extension.zip
specify workflow add https://github.com/Azure-Samples/Spec2Cloud/releases/download/spec-kit-spec2cloud-v<VERSION>/workflow.yml
```

After install, your repo should contain:

```
.specify/
├── extensions/spec2cloud/
│   ├── extension.yml
│   └── commands/{speckit.spec2cloud.deploy.md, speckit.spec2cloud.verify.md}
├── presets/spec2cloud/
│   ├── preset.yml
│   ├── commands/...
│   └── templates/...
└── workflows/spec2cloud/
    └── workflow.yml
```

## Practical example — TODO Web App on Azure

The example walks the full workflow for a small feature ("TODO WebApp") on Azure Container Apps + Cosmos DB. Run each command from your coding agent's chat (the slash commands invoke the skills in `.github/skills` folder).

1. **One-time: project constitution.**

   ```
   /speckit-constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
   ```

   Confirm the default principles and add any project rules.

2. **Specify the feature.**

   ```
   /speckit-specify Simple todo app that allows users to get the job done.
   ```

   Produces `specs/001-todo-webapp/spec.md` and `.specify/feature.json`.

3. **Plan.**

   ```
   /speckit-plan Use React+Vite for the frontend and a Node.js API for the backend, with MongoDB handling data persistence. Deploy the frontend and backend using Container Apps, and use Azure Cosmos DB for MongoDB as the managed database. Create a resource group in westeurope named lab-todo-app for the Azure resources.
   ```

   Produces `specs/001-todo-webapp/plan.md` with Azure topology, architecture, and design decisions.

4. **Tasks.**

   ```
   /speckit-tasks
   ```

   Produces `tasks.md` (human) and `tasks.json` (machine) — phase-grouped, dependency-ordered, both kept in sync.

5. **Implement.**

   ```
   /speckit-implement
   ```

   Walks tasks in order, flipping `- [ ]` → `- [x]` in `tasks.md` and `"status": "pending"` → `"done"` in `tasks.json`.

6. **Verify locally.**

   ```
   /speckit-verify
   ```

   Inventories runnable components and dependencies; provisions the Azure-only ones into a `dev` env first; runs the rest locally (Azurite, Cosmos Emulator, `az containerapp` locally, etc.) and walks the spec's acceptance scenarios.

7. **Deploy.**

   ```
   /speckit-deploy dev
   ```

   Locates the IaC entry point (`azure.yaml` → `infra/main.bicep` → `main.bicep` → `infra/main.tf` → `main.tf`), runs the appropriate tool (`azd up` / `az deployment group create` / `terraform apply`), shows what-if first, and reports outputs.


### Or run it as a single workflow

If you have the workflow installed, kick off the whole cycle with one command and approve at each gate:

```
specify workflow run spec2cloud --input spec="build a simple todo app using react+vite"
```

The workflow runs `constitution → specify → clarify → plan → tasks → implement → verify → deploy` with a review gate after each step.

## Publishing releases

All three components are published together as a **single GitHub Release** by the [`spec-kit-publish`](../.github/skills/spec-kit-publish/SKILL.md) skill. Each is attached as its own asset:

- `extension.zip`
- `preset.zip`
- `workflow.yml`

The zips contain the **files inside** the component folder (not the folder itself). The release tag is `spec-kit-spec2cloud-v<version>`, where `<version>` is the highest semver among the three manifest versions.

### Invoking the skill

```
/spec-kit-publish
```

The skill reads each manifest, computes the release version (max of the three), and only publishes when that version is newer than the latest existing `spec-kit-spec2cloud-v*` release.

### Bumping a version

Bump the `version` field in the relevant manifest before invoking the skill:

- Extension → [`extensions/spec2cloud/extension.yml`](extensions/spec2cloud/extension.yml) → `extension.version`
- Preset → [`presets/spec2cloud/preset.yml`](presets/spec2cloud/preset.yml) → `preset.version`
- Workflow → [`workflows/spec2cloud/workflow.yml`](workflows/spec2cloud/workflow.yml) → `workflow.version`

Follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

### Prerequisites

- The [`gh` CLI](https://cli.github.com/) must be installed and authenticated (`gh auth status`).
- You must have permission to create releases in this repository.
