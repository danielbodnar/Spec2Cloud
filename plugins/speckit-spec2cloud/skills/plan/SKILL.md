---
name: plan
description: Create plan.md (technical context, architecture, design decisions) from the spec.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) = additional planning guidance: constraints, preferences, tech choices to honor. Empty = plan from the spec as-is.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `specs/constitution.md` (principles, non-negotiables, out-of-scope) and `<feature_directory>/spec.md` (source of truth for *what* and *why*). Stop if either is missing and name the command to run first (`/speckit:constitution` or `/speckit:specify`).

2. **Create the plan** based on `assets/plan-template.md`, stored in `<feature_directory>/plan.md` with these sections:
   - **Technical context** — language(s), runtime, key dependencies, target platform(s), external services (especially cloud/Azure).
   - **Architecture** — components and how they interact; brief diagram or component list.
   - **Project structure** — top-level directory layout and where new code will live.
   - **Design decisions** — each as *Decision → Rationale → Alternatives considered*. Cover data model, interfaces/contracts, cloud topology when relevant.
   - **Risks & open questions** — anything that could derail implementation, plus any `[NEEDS CLARIFICATION: <question>]` markers carried over from the spec or newly discovered.

   Guidelines: honor every constitution non-negotiable — if user request conflicts, surface it explicitly rather than silently overriding; make informed defaults, marking genuine unknowns as `[NEEDS CLARIFICATION: <question>]` instead of guessing; focus on *how* — *what*/*why* belong in `spec.md`, don't restate it; don't enumerate individual tasks or write code (that's `/speckit:tasks` and `/speckit:implement`).

3. **Create the Azure deployment plan** based on `assets/azure-template.md`, stored at the workspace root `/azure.md`. Fill in every field defined by the template; in particular:
   - **AZD Template** — propose the best match from the **Use Case → AZD Template Mapping** table below (e.g. `Azure-Samples/azd-ai-starter-basic`, `Azure-Samples/todo-csharp-cosmos-sql`). **ASK** the user to choose one of:
     - **Accept** the suggestion.
     - **Pick a different template** from the catalog.
     - **Start from a minimal scaffold** with no template (record `minimal` in `azure.md`; step 5 will use `azd init --minimal`).
     - **Opt out** of `azd init` entirely (record `none` in `azure.md`).
   - **AZD Environment** — default to `dev`; **ASK** the user to confirm.
   - **Azure Subscription Id / Name** — read the current default with `az account show -o json` and **ASK** the user to confirm both id and display name.
   - **Resource Group** — propose `rg-<feature-name>` and verify it doesn't already exist with `az group exists --name <name>`. If it exists, suggest an alternative (e.g. append a short suffix). **ASK** the user to confirm the final name before writing it to `azure.md`.
   - **Azure Region** — suggest a region appropriate for the chosen AZD template and **ASK** the user to confirm.
   - **Other sections** — keep only the sections required by the chosen template / use case; delete the rest per the template's guidance.

   Where possible, group above asks to the user to simplify interactions.
   Never invent a subscription, region, or resource group. Mark anything still unresolved as `[NEEDS CLARIFICATION: <question>]`.

4. **Install skills** — Skills required to plan and implement the feature. Using the **Skills → AZD Templates Mapping** table below, derive the recommended skill set for the chosen AZD template and fill-in the table in the `Skills` section.
      - **Minimal set (always recommended)**: `azure-cost`.
      - **Add template-specific skills** based on the mapping (e.g. `microsoft-foundry`, `azure-ai` for `Azure-Samples/azd-ai-starter-basic`; `azure-messaging` when the template provisions Service Bus / Event Grid; etc.).

      Present the proposed list (minimal + template-specific) to the user and **ASK** for confirmation before filling in the **Skills** section.

    ```bash
    gh skills install <SKILL repository> <SKILL name> --dir .github/skills --agent github-copilot
    ```
    If a skill is already present under `.github/skills/`, **ASK** the user whether to reinstall (update to the latest version) or keep the existing version; skip the install when the user chooses to keep it.

5. **Execute skills** to populate values in `/azure.md` that depend on a skill execution. If a field's value must be produced by a skill, run that skill in-place, **ASK** the user to confirm the skill output suggestion and write the resolved value into `/azure.md`. Do not leave `[NEEDS CLARIFICATION: populate via <skill-name>]` markers behind — `/speckit:plan` must exit with `/azure.md` fully resolved.

6. **Report** the paths to `<feature_directory>/plan.md` and `<feature_directory>/azure.md`, a one-line summary of the chosen approach (including the selected AZD template), the list of recommended skills (installed by `/speckit:implement`), and any unresolved `[NEEDS CLARIFICATION]` items from either file.

## AZD Templates Reference

Use the catalog and mapping tables below as the source of truth when selecting the **AZD Template** value in step 3. Prefer the use-case mapping first; fall back to the full catalog only when no mapping row fits.

### Catalog

The following Azure Developer CLI (`azd`) templates are available from the [Azure Developer CLI templates overview](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/azd-templates):

| GitHub repo | Template Name | Language | App host | Tech Stack |
| --- | --- | --- | --- | --- |
| [Azure-Samples/azd-ai-starter-basic](https://github.com/Azure-Samples/azd-ai-starter-basic) | Microsoft Foundry resources for building and running AI agents | IaC only | — | Microsoft Foundry, Azure Container Registry, Application Insights, Log Analytics Workspace |
| [Azure-Samples/todo-csharp-cosmos-sql](https://github.com/Azure-Samples/todo-csharp-cosmos-sql) | React Web App with C# API and MongoDB on Azure | C# | Azure App Service | Azure Cosmos DB for NoSQL, Bicep |
| [Azure-Samples/todo-csharp-sql](https://github.com/azure-samples/todo-csharp-sql) | React Web App with C# API and SQL Database on Azure | C# | Azure App Service | Azure SQL Database, Bicep |
| [Azure-Samples/todo-csharp-sql-swa-func](https://github.com/Azure-Samples/todo-csharp-sql-swa-func) | Static React Web App + Functions with C# API and SQL Database on Azure | C# | Azure Static Web Apps, Azure Functions | Azure SQL Database, Bicep |
| [Azure-Samples/todo-java-mongo](https://github.com/Azure-Samples/todo-java-mongo) | React Web App with Java API and MongoDB on Azure | Java | Azure App Service | Azure Cosmos DB API for Mongo, Bicep |
| [Azure-Samples/todo-java-mongo-aca](https://github.com/Azure-Samples/todo-java-mongo-aca) | Containerized React Web App with Java API and MongoDB on Azure | Java | Azure Container Apps | Azure Cosmos DB API for Mongo, Bicep |
| [Azure-Samples/todo-nodejs-mongo](https://github.com/azure-samples/todo-nodejs-mongo) | React Web App with Node.js API and MongoDB on Azure | Node.js | Azure App Service | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-nodejs-mongo-terraform](https://github.com/azure-samples/todo-nodejs-mongo-terraform) | React Web App with Node.js API and MongoDB (Terraform) on Azure | Node.js | Azure App Service | Azure Cosmos DB for MongoDB, Terraform |
| [Azure-Samples/todo-nodejs-mongo-aca](https://github.com/azure-samples/todo-nodejs-mongo-aca) | Containerized React Web App with Node.js API and MongoDB on Azure | Node.js | Azure Container Apps | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-nodejs-mongo-swa-func](https://github.com/azure-samples/todo-nodejs-mongo-swa-func) | Static React Web App + Functions with Node.js API and MongoDB on Azure | Node.js | Azure Static Web Apps, Azure Functions | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-nodejs-mongo-aks](https://github.com/Azure-Samples/todo-nodejs-mongo-aks) | Kubernetes React Web App with Node.js API and MongoDB on Azure | Node.js | Azure Kubernetes Service | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-python-mongo](https://github.com/azure-samples/todo-python-mongo) | React Web App with Python API and MongoDB on Azure | Python | Azure App Service | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-python-mongo-terraform](https://github.com/Azure-Samples/todo-python-mongo-terraform) | React Web App with Python API and MongoDB (Terraform) on Azure | Python | Azure App Service | Azure Cosmos DB for MongoDB, Terraform |
| [Azure-Samples/todo-python-mongo-aca](https://github.com/azure-samples/todo-python-mongo-aca) | Containerized React Web App with Python API and MongoDB on Azure | Python | Azure Container Apps | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/todo-python-mongo-swa-func](https://github.com/azure-samples/todo-python-mongo-swa-func) | Static React Web App + Functions with Python API and MongoDB on Azure | Python | Azure Static Web Apps, Azure Functions | Azure Cosmos DB for MongoDB, Bicep |
| [Azure-Samples/azd-starter-bicep](https://github.com/Azure-Samples/azd-starter-bicep) | Bicep Starter | IaC only | — | Bicep, dev container configuration, CI/CD pipeline definitions |
| [Azure-Samples/azd-starter-terraform](https://github.com/Azure-Samples/azd-starter-terraform) | Terraform Starter | IaC only | — | Terraform, dev container configuration, CI/CD pipeline definitions |

### Use Case → AZD Template Mapping

Match the feature's primary use case and language preference to a recommended template:

| Use Case | Language | Recommended AZD Template |
| --- | --- | --- |
| Microsoft Foundry (Hosted Agents, Models) | C#, Python | [Azure-Samples/azd-ai-starter-basic](https://github.com/Azure-Samples/azd-ai-starter-basic) |
| Web app + REST API + NoSQL database (PaaS) | C# | [Azure-Samples/todo-csharp-cosmos-sql](https://github.com/Azure-Samples/todo-csharp-cosmos-sql) |
| Web app + REST API + relational database (PaaS) | C# | [Azure-Samples/todo-csharp-sql](https://github.com/azure-samples/todo-csharp-sql) |
| Serverless static web app + functions API + relational database | C# | [Azure-Samples/todo-csharp-sql-swa-func](https://github.com/Azure-Samples/todo-csharp-sql-swa-func) |
| Web app + REST API + document database (PaaS) | Java | [Azure-Samples/todo-java-mongo](https://github.com/Azure-Samples/todo-java-mongo) |
| Containerized microservices web app + API + document database | Java | [Azure-Samples/todo-java-mongo-aca](https://github.com/Azure-Samples/todo-java-mongo-aca) |
| Web app + REST API + document database (PaaS) | Node.js | [Azure-Samples/todo-nodejs-mongo](https://github.com/azure-samples/todo-nodejs-mongo) |
| Web app + REST API + document database with Terraform IaC | Node.js | [Azure-Samples/todo-nodejs-mongo-terraform](https://github.com/azure-samples/todo-nodejs-mongo-terraform) |
| Containerized microservices web app + API + document database | Node.js | [Azure-Samples/todo-nodejs-mongo-aca](https://github.com/azure-samples/todo-nodejs-mongo-aca) |
| Serverless static web app + functions API + document database | Node.js | [Azure-Samples/todo-nodejs-mongo-swa-func](https://github.com/azure-samples/todo-nodejs-mongo-swa-func) |
| Kubernetes-orchestrated web app + API + document database | Node.js | [Azure-Samples/todo-nodejs-mongo-aks](https://github.com/Azure-Samples/todo-nodejs-mongo-aks) |
| Web app + REST API + document database (PaaS) | Python | [Azure-Samples/todo-python-mongo](https://github.com/azure-samples/todo-python-mongo) |
| Web app + REST API + document database with Terraform IaC | Python | [Azure-Samples/todo-python-mongo-terraform](https://github.com/Azure-Samples/todo-python-mongo-terraform) |
| Containerized microservices web app + API + document database | Python | [Azure-Samples/todo-python-mongo-aca](https://github.com/azure-samples/todo-python-mongo-aca) |
| Serverless static web app + functions API + document database | Python | [Azure-Samples/todo-python-mongo-swa-func](https://github.com/azure-samples/todo-python-mongo-swa-func) |
| Greenfield infrastructure-only project (Bicep) | Any | [Azure-Samples/azd-starter-bicep](https://github.com/Azure-Samples/azd-starter-bicep) |
| Greenfield infrastructure-only project (Terraform) | Any | [Azure-Samples/azd-starter-terraform](https://github.com/Azure-Samples/azd-starter-terraform) |

## Skills → AZD Templates Mapping

The following table maps the [Azure skills](https://github.com/microsoft/azure-skills/tree/main/skills) catalog to the AZD templates where each skill is most relevant. Use it to install the right set of skills alongside the chosen template.

Install a skill with:

```bash
gh skills install <SKILL repository> <SKILL name> --dir .github/skills --agent github-copilot
```

For every skill below, `<SKILL repository>` is `microsoft/azure-skills` and `<SKILL name>` is the value in the **SKILL name** column.

### Default skill set (always recommended)

Install these on every feature regardless of the chosen AZD template. All come from `microsoft/azure-skills`.

- `azure-cost`

### Template-specific skills

Add these on top of the default set when the chosen AZD template matches.

| SKILL repository | SKILL name | AZD templates where it applies |
| --- | --- | --- |
| [Azure-Samples/Spec2Cloud](https://github.com/Azure-Samples/Spec2Cloud/tree/main/skills/foundry-models-selector) | `foundry-models-selector@main` | `Azure-Samples/azd-ai-starter-basic` |
| [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/microsoft-agent-framework) | `microsoft-agent-framework` | `Azure-Samples/azd-ai-starter-basic` |
| [microsoft/azure-skills](https://github.com/microsoft/azure-skills/tree/main/skills/airunway-aks-setup) | `airunway-aks-setup` | `Azure-Samples/todo-nodejs-mongo-aks` |
| [microsoft/azure-skills](https://github.com/microsoft/azure-skills/tree/main/skills/azure-compute) | `azure-compute` | All `todo-*` PaaS / ACA templates (App Service + Container Apps variants) |
| [microsoft/azure-skills](https://github.com/microsoft/azure-skills/tree/main/skills/azure-kubernetes) | `azure-kubernetes` | `Azure-Samples/todo-nodejs-mongo-aks` |
| [microsoft/azure-skills](https://github.com/microsoft/azure-skills/tree/main/skills/azure-messaging) | `azure-messaging` | Templates that add Service Bus / Event Grid (typically the `*-aca` and `*-aks` variants) |
