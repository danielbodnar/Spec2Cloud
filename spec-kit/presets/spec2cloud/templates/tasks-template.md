---
description: "Spec2Cloud tasks template — phase-grouped, dependency-ordered tasks for implementing an Azure feature."
---

# Tasks: [FEATURE NAME]

**Inputs**: `<feature_directory>/spec.md`, `<feature_directory>/plan.md`, `.specify/memory/constitution.md` (all required) · **Sibling artifact**: `<feature_directory>/tasks.json` — same IDs, descriptions, and order. **Keep them in sync.** `/speckit.implement` updates both on every completion.

> Generated/updated by `/speckit.tasks`. Each item is `- [ ] [TaskID] [P?] [Story] Description with file path(s)`.
> - `TaskID` = `T###`, zero-padded, sequential across the whole file.
> - `[P]` = safe to run in parallel (different files, no shared state).
> - `[Story]` = ties task to a user story (`US1`, `US2`, …); omit on cross-cutting tasks.
> - Tests are **opt-in** — include only when the spec or user requests them.
> - Carry forward any `[NEEDS CLARIFICATION: <question>]` markers as `Resolve: <question>` tasks in **Setup**.

## Phase 1 — Setup

**Purpose**: Project scaffolding, dependencies, tooling, and Azure prerequisites needed before anyone writes domain code.

- [ ] T001 Create project structure per `plan.md` (e.g. `src/`, `infra/`, `tests/`)
- [ ] T002 Initialize [language] project with [framework] dependencies in `<file>`
- [ ] T003 [P] Configure linting / formatting / pre-commit hooks
- [ ] T004 [P] Provision Azure prerequisites: confirm subscription, target resource group(s) `<name>`, region `<region>`, required RBAC roles
- [ ] T005 [P] Resolve: [NEEDS CLARIFICATION: …] (one task per outstanding marker)

---

## Phase 2 — Foundational (blocking)

**Purpose**: Shared modules, data model, infrastructure, and contracts every user story depends on. **No user-story task may start until this phase is complete.**

- [ ] T010 Define base entities / value objects from `plan.md §Design decisions` in `src/domain/`
- [ ] T011 [P] Establish IaC entry point (`azure.yaml` / `infra/main.bicep` / `infra/main.tf`) for resources declared in `plan.md §Azure topology`
- [ ] T012 [P] Wire Azure SDK clients with managed identity in `src/infra/` (Cosmos DB / Storage / Service Bus / Key Vault as applicable)
- [ ] T013 [P] Configure Application Insights / OpenTelemetry exporter and Log Analytics destination
- [ ] T014 Set up environment configuration (App Configuration / env vars) — no secrets inline; use Key Vault references
- [ ] T015 Configure error handling and structured logging conventions

**Checkpoint**: Foundation ready — user-story phases may begin (in parallel if staffed).

---

## Phase 3 — User Story 1: [Title] (Priority: P1) 🎯 MVP

**Goal**: [What this slice delivers — one sentence.]
**Independent test**: [How to demo this story on its own — ties back to `spec.md §Success criteria`.]
**Satisfies**: [`FR-001`, `SC-001`, …]

### Tests for User Story 1 *(opt-in)*

> Write these first; ensure they fail before implementing.

- [ ] T020 [P] [US1] Contract test for `<endpoint>` in `tests/contract/test_<name>.<ext>`
- [ ] T021 [P] [US1] Integration test for `<user journey>` in `tests/integration/test_<name>.<ext>`

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create `<Entity1>` in `src/domain/<entity1>.<ext>`
- [ ] T023 [P] [US1] Create `<Entity2>` in `src/domain/<entity2>.<ext>`
- [ ] T024 [US1] Implement `<Service>` in `src/domain/<service>.<ext>` (depends on T022, T023)
- [ ] T025 [US1] Implement `<endpoint/trigger>` in `src/api/<file>.<ext>`
- [ ] T026 [US1] Add validation, error mapping, and structured logging
- [ ] T027 [US1] Provision Azure resources for US1 in `infra/` (queues, containers, RBAC role assignments)

**Checkpoint**: User Story 1 is independently functional and demoable.

---

## Phase 4 — User Story 2: [Title] (Priority: P2)

**Goal**: … · **Independent test**: … · **Satisfies**: [`FR-…`, `SC-…`]

### Tests for User Story 2 *(opt-in)*
- [ ] T030 [P] [US2] …

### Implementation for User Story 2
- [ ] T031 [P] [US2] …
- [ ] T032 [US2] …

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5 — User Story 3: [Title] (Priority: P3)

**Goal**: … · **Independent test**: … · **Satisfies**: [`FR-…`, `SC-…`]

- [ ] T040 [P] [US3] …
- [ ] T041 [US3] …

**Checkpoint**: All user stories independently functional.

---

## Phase N — Polish & deployment hardening

**Purpose**: Cross-cutting work that makes the feature production- and `/speckit.deploy`-ready.

- [ ] T090 [P] Documentation updates in `docs/` and feature `README.md`
- [ ] T091 [P] Add KQL dashboard queries / alerts in Application Insights
- [ ] T092 Review IaC against `azd provision --preview` / `az deployment what-if`; capture output in PR
- [ ] T093 Verify Key Vault references and managed-identity role assignments end-to-end
- [ ] T094 Confirm region(s) and data-residency constraints from the constitution are honored
- [ ] T095 Smoke-test the deployed resources from `plan.md §Deployment` (endpoint health, queue throughput, …)
- [ ] T096 Update `<feature_directory>/checklists/` (e.g. `azure.md`, `security.md`) via `/speckit.checklist`
- [ ] T097 Optional: performance / load testing against Success Criteria targets

---

## Dependencies & execution order

**Phase order**: Setup → Foundational → User stories (P1 → P2 → P3, parallel if staffed) → Polish. Foundational blocks all user-story phases. Polish depends on every user story you intend to ship.

**Within a user story**: resolve any open `[NEEDS CLARIFICATION: …]` from Setup before implementation; tests (when included) before implementation; domain models before services; services before API/triggers; provision Azure resources before code that depends on them; story checkpoint passes before moving to next priority.

**Parallel opportunities**: all `[P]` tasks within a phase can run in parallel (different files, no shared state); different user stories can run in parallel after the Foundational checkpoint; IaC, observability wiring, and SDK client setup in Phase 2 are typically `[P]`.

---

## Sync rule

This file and `tasks.json` must remain identical in IDs, descriptions, order, and status. `/speckit.implement` flips `- [ ]` → `- [x]` here and `"status": "pending"` → `"status": "done"` there in the same step. If they diverge, `/speckit.analyze` flags it as `CRITICAL` and `/speckit.implement` refuses to run until reconciled.

## Notes

- Keep tasks small enough to complete in one focused step; split anything larger.
- Reference concrete files in every task description.
- Avoid cross-story coupling that breaks the "independently testable" promise from `spec.md`.
- Commit after each task or each logical group; leave the working tree clean at every checkpoint.
- Constitution non-negotiables (Azure target, Key Vault + managed identity, Entra ID, reproducible deploys, gated prod) are not optional — `/speckit.implement` halts on a violation.
