---
name: checklist
description: Generate a domain-focused checklist that validates the quality of the requirements (completeness, clarity, consistency, measurability, coverage) — not the implementation.
---

## User Input

```text
$ARGUMENTS
```

## Concept — "Unit tests for English"

A checklist generated here is a **unit-test suite for the requirements themselves**. Items must evaluate spec/plan/tasks for **completeness, clarity, consistency, measurability, coverage** — never whether code or infra behaves correctly.

- ✅ "Is 'fast loading' quantified with a specific timing threshold? [Clarity, Spec §NFR-2]"
- ✅ "Are rollback requirements defined for failed Azure deployments? [Gap]"
- ❌ "Verify the function returns 200" / "Test that the deployment succeeds"

If you catch yourself writing "Verify", "Test", "Check that … works", "Click", "Navigate", or any reference to runtime behavior — rewrite as a question about whether the requirement is well-written.

## Outline

`$ARGUMENTS` (if any) = requested theme (`security`, `ux`, `api`, `performance`, `azure`, `deploy`, …). Empty = ask the user which checklist they want.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `constitution.md` plus whichever of `spec.md`, `plan.md`, `tasks.md`, `tasks.json` exist. Stop if `spec.md` missing (run `/speckit:specify`).

2. **Clarify intent** — at most **three** focused questions, only when `$ARGUMENTS` + artifacts leave material ambiguity. Cover: theme/focus area; depth (lightweight pre-commit vs. formal release gate); audience/timing (author self-review, peer PR, QA, release sign-off). Skip already-answered ones. After answers, up to two follow-ups (max five total) only if a scenario class (alternate / exception / recovery / non-functional) remains unaddressed — cite the gap. When non-interactive, default to: depth = standard, audience = peer reviewer (PR), focus = top theme inferred from spec.

3. **Filename + ID start**. Ensure `<feature_directory>/checklists/`. Use short theme-based name `<theme>.md` (e.g. `security.md`, `azure.md`, `deploy.md`). New file → number from `CHK001`. Existing file → append continuing the last `CHK###`; never delete or rewrite existing items.

4. **Generate the checklist** following [`assets/checklist-template.md`](assets/checklist-template.md) when available. Else emit:
   - `# <Theme> requirements checklist` (H1)
   - Meta lines: created date, feature, source artifacts considered.
   - `## <Quality dimension>` headings grouping items by **Completeness**, **Clarity**, **Consistency**, **Acceptance criteria quality**, **Scenario coverage**, **Edge cases**, **Non-functional**, **Dependencies & assumptions**, **Ambiguities & conflicts**.
   - Items as `- [ ] CHK### <question> [Dimension, Spec §X.Y or Gap/Ambiguity/Conflict/Assumption]`.

   Item rules: phrase every item as a question about the **requirement**, not the implementation; tag with ≥1 quality dimension; ≥**80%** of items must include a traceability marker (`[Spec §X.Y]` / `[Plan §X.Y]` or one of `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`); cap raw output at ~40 items, merging near-duplicates and rolling >5 minor edge cases into a single coverage question; carry forward any `[NEEDS CLARIFICATION: …]` markers as `[Ambiguity]`; never invent requirements not grounded in the artifacts — write a `[Gap]` item asking whether to specify them.

5. **Spec2cloud themes** — when theme is `azure` or `deploy`, additionally ask whether the spec/plan address: target Azure services + regions + SKU/pricing tiers (specified vs. assumed); identity model (managed identity vs. service principal) + RBAC role assignments; networking (private endpoints, VNet integration, public access, egress); secret handling (Key Vault refs vs. inline); data residency, retention, backup; observability (logs, metrics, traces, alerts); IaC entry point (`azure.yaml` / Bicep / Terraform) + env promotion (`dev` → `staging` → `prod`); rollback + what-if/preview requirements for `/speckit:deploy`.

6. **Report**: checklist path, **created** vs. **appended**, item count + starting/ending `CHK` IDs, theme/depth/audience used, any explicit user must-haves incorporated.
