# [PROJECT_NAME] Constitution

> Generated/updated by `/speckit-constitution`. Keep every line **terse and actionable** — downstream commands (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-spec2cloud-deploy`) read this file as source of truth and treat **Non-negotiable rules** as hard constraints.

## Project name & purpose

[ONE_LINE_IDENTITY_AND_PROBLEM_THIS_PROJECT_SOLVES]
<!-- Example: TaskFlow — a self-hosted task tracker on a single Azure App Service plan + Cosmos DB serverless, GDPR-compliant EU residency. -->

## Guiding principles

Defaults baked in by Spec2Cloud — keep unless explicitly opted out; add 0–3 project-specific principles after them (3–7 total). One sentence each, optional one-line rationale.

### I. Azure is the default deployment target
Every component runs on Azure. Specs/plans/tasks/`/speckit-spec2cloud-deploy` assume Azure as runtime, identity, data, and observability platform. Other clouds or on-prem are out of scope unless explicitly added below.

### II. Cloud-native by default
Use managed Azure services (Microsoft Foundry, App Service / Container Apps / Functions, Cosmos DB, Storage, Service Bus, Key Vault, Entra ID, Log Analytics) instead of self-hosting. No self-hosted database, queue, or identity provider unless a managed equivalent doesn't exist.

### III. [PROJECT_PRINCIPLE_1]
[OPTIONAL_PROJECT_SPECIFIC_PRINCIPLE]
<!-- Add project-specific principles here. Delete this section if none. -->

## Non-negotiable rules

Hard constraints. `/speckit-plan`, `/speckit-implement`, `/speckit-spec2cloud-deploy` must refuse to proceed when violated; `/speckit-analyze` flags any violation as `CRITICAL`. The first three are Spec2Cloud defaults — keep unless explicitly overridden.

- [x] **Azure is the deployment target.** `/speckit-spec2cloud-deploy` provisions to Azure via azd with Bicep, or Terraform; no other cloud or on-prem.
- [ ] [PROJECT_RULE_1]
  <!-- Example: All Azure resources deployed to `westeurope` or `northeurope` (data residency). -->
- [ ] [PROJECT_RULE_2]
  <!-- Example: No public endpoints — every service via private endpoint + VNet integration. -->

## Out of scope

Things the project explicitly will **not** do, to prevent scope drift in `/speckit-specify` and `/speckit-plan`.

- [OPTIONAL_OUT_OF_SCOPE]
  <!-- Add project-specific out-of-scope items, or remove this line. -->

## Open questions

Unknowns that block downstream work. Carry forward as `[NEEDS CLARIFICATION: <question>]` markers; resolve via `/speckit-clarify`.

- [NEEDS CLARIFICATION: <question>]

---

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [YYYY-MM-DD] | **Last Amended**: [YYYY-MM-DD]
<!-- Example: Version: 1.2.0 | Ratified: 2026-02-04 | Last Amended: 2026-04-28 -->

<!--
  Editing rules for /speckit-constitution:
  - Merge user input with existing content; preserve prior rules unless explicitly overridden.
  - Every line must be actionable by /speckit-specify, /speckit-plan, /speckit-tasks, /speckit-implement, or /speckit-spec2cloud-deploy.
  - Mark genuine unknowns with [NEEDS CLARIFICATION: <question>] rather than inventing constraints.
  - No implementation details, file structures, or task lists — those belong in plan.md and tasks.md.
  - Bump version when ratified rules change: MAJOR — non-negotiable removed/weakened; MINOR — new principle/rule added; PATCH — wording/clarification only.
  - Delete this comment block when first populating the file.
-->
