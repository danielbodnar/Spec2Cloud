# Azure Deployment Plan: [FEATURE]

## Template initialization

- **AZD Template**: [one of: a catalog repo (e.g. `Azure-Samples/azd-ai-starter-basic`, `Azure-Samples/todo-csharp-cosmos-sql`); `minimal` — scaffold via `azd init --minimal` (no template); `none` — skip `azd init` entirely (no `azure.yaml` will exist; `/speckit-spec2cloud-verify` and `/speckit-spec2cloud-deploy` are no-ops)]
- **AZD Environment**: [`dev` | `test` | `prod`]
- **Azure Subscription**:
  - **Id**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
  - **Name**: [display name from `az account show`]
- **Resource Group**: `rg-<feature-name>` — persisted as the `AZURE_RESOURCE_GROUP` AZD environment variable
- **Azure Region**: [e.g. `eastus`, `westeurope`, `uksouth`]

## Additional environment variables

> Variables that `/speckit-implement` will persist via `azd env set` after `AZURE_RESOURCE_GROUP`. One row per variable. `Source` records how the value was produced (constant, skill name, user input, `az` query). `/speckit-plan` must resolve every value here — no `[NEEDS CLARIFICATION: …]` markers may remain when handing off to `/speckit-implement`.

| Variable | Value | Source |
|----------|-------|--------|
| `AZURE_LOCATION` | `<region>` | mirrors **Azure Region** above |

### Reference: common variable groups

Add rows to the table above only when the feature actually needs them.

**Microsoft Foundry models** (when the feature consumes Foundry models):

| Variable | Value | Source |
|----------|-------|--------|
| `AI_PROJECT_DEPLOYMENTS` | `<resolved-by-skill>` | `foundry-models-selector` skill |

**Microsoft Foundry hosted agents** (when the feature uses hosted agents):

| Variable | Value | Source |
|----------|-------|--------|
| `ENABLE_HOSTED_AGENTS` | `true` | constant |
| `ENABLE_CAPABILITY_HOST` | `false` | constant |
