---
name: speckit-analyze
description: Read-only consistency, coverage, and Azure-readiness analysis across constitution, spec, plan, and tasks.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) narrows scope: artifact (`spec`/`plan`/`tasks`), category (`coverage`/`ambiguity`/`azure`), or a `T###`. Empty = analyze everything.

**Strictly read-only.** Never modify files; only produce a report.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `constitution.md`, `spec.md`, `plan.md`, `tasks.md`, `tasks.json`. Stop if any is missing and name the command to run first (`/speckit-specify` / `/speckit-plan` / `/speckit-tasks`). If `tasks.md` and `tasks.json` disagree (IDs, descriptions, order), record as `CRITICAL` and stop.

2. **Build a lightweight model** (don't echo raw artifact text in the report):
   - Functional requirements + success criteria from `spec.md`, keyed by explicit IDs (`FR-001`, `SC-002`) when present, else imperative slug.
   - Architecture decisions, Azure services, non-negotiables from `plan.md` + constitution.
   - Tasks from `tasks.json` with `depends_on`, `parallel_with`, `satisfies`, `files`, `status`.

3. **Detection passes** — high-signal only, cap 50 findings, summarize overflow:
   - **Constitution alignment** — any element conflicting with a non-negotiable. Always `CRITICAL`.
   - **Coverage** — requirements/criteria with no task in `satisfies`; tasks whose `satisfies` references nothing in spec.
   - **Duplication** — near-duplicate requirements or tasks.
   - **Ambiguity** — vague terms (`fast`, `secure`, `scalable`, `robust`) without measurable criteria; unresolved markers (`TODO`, `???`, `[NEEDS CLARIFICATION: …]`, `Resolve: …`).
   - **Underspecification** — tasks without `files`; requirements with verbs but no measurable outcome; user stories missing acceptance criteria.
   - **Inconsistency** — terminology drift; entities in plan but not spec (or vice versa); dependency cycles or out-of-order `depends_on`.
   - **Azure readiness** — services in `plan.md` with no provisioning task; identity/RBAC, networking, region, or data-residency constraints unaddressed; secrets/connection strings inline instead of via Key Vault / managed identity; missing IaC entry point (`azure.yaml`, `infra/main.bicep`, `main.bicep`, `infra/main.tf`, `main.tf`) when plan declares Azure resources.

4. **Severity**:
   - **CRITICAL** — violates a non-negotiable, blocks baseline functionality, or breaks `tasks.md`/`tasks.json` sync.
   - **HIGH** — conflicting requirements, ambiguous security/perf attribute, untestable acceptance criterion, missing provisioning for a declared Azure service.
   - **MEDIUM** — terminology drift, missing non-functional coverage, underspec'd edge case, missing IaC for declared resources.
   - **LOW** — wording, minor redundancy.

5. **Emit the report** as Markdown only (no file writes):

   ```markdown
   ## Specification Analysis Report

   | ID | Category | Severity | Location(s) | Summary | Recommendation |
   |----|----------|----------|-------------|---------|----------------|
   | C1 | Constitution | CRITICAL | plan.md §Architecture | … | … |

   ### Coverage
   | Requirement / Criterion | Has Task? | Task IDs | Notes |
   |-------------------------|-----------|----------|-------|

   ### Unmapped Tasks
   - T### — description (no `satisfies`)

   ### Azure Readiness
   - Service / constraint → status (covered / missing IaC / missing task)

   ### Metrics
   - Requirements: N
   - Tasks: N (pending: N, done: N)
   - Coverage: N% (requirements with ≥1 task)
   - Ambiguity findings: N
   - Duplication findings: N
   - CRITICAL findings: N
   ```

   Use stable finding IDs by category initial: `C` constitution, `V` coverage, `D` duplication, `A` ambiguity, `U` underspec, `I` inconsistency, `Z` azure.

6. **Next actions**. If any `CRITICAL`, recommend resolving before `/speckit-implement` or `/speckit-deploy` and name the command(s) to run. If only `LOW`/`MEDIUM`, note user may proceed and list suggestions. Ask whether to produce concrete remediation suggestions for the top findings — never apply edits.

## Guidelines

- Read-only — never modify files.
- Don't invent missing sections; report them as findings.
- Constitution non-negotiables outrank everything else — only addressable by changing spec/plan/tasks or via `/speckit-constitution`.
- Cite specific locations (file + section or task ID), not generic patterns.
- Rerunning on unchanged artifacts must produce identical finding IDs + counts.
