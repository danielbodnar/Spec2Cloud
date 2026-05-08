---
name: speckit-clarify
description: Ask up to 5 targeted clarification questions to resolve ambiguity in the spec, then write the answers back into spec.md.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` (if any) narrows scope: a category (`security`, `data`, `performance`, `azure`) or a specific term. Empty = scan the whole spec.

Run **before** `/speckit-plan`. If user is doing an exploratory spike and wants to skip, proceed but warn rework risk increases.

1. **Load context**. Read `specs/feature.json` → `<feature_directory>`. Read `<feature_directory>/spec.md` and `constitution.md`. Stop if `spec.md` missing (run `/speckit-specify`).

2. **Scan for ambiguity** across these dimensions; mark each **Clear** / **Partial** / **Missing** (keep map internal): functional scope, success criteria, out-of-scope, user roles; domain & data model (entities, attributes, relationships, identity, lifecycle, scale); interaction & UX (critical journeys, error/empty/loading states, accessibility, localization); non-functional (perf, scalability, reliability/availability, observability, security/privacy, compliance); integration & dependencies (external services, failure modes, data formats, versioning); edge cases & failure handling (negative flows, throttling, conflict resolution); constraints & tradeoffs (tech, hosting, rejected alternatives); terminology (glossary, deprecated synonyms); completion signals (testable acceptance criteria, measurable DoD); placeholders (`TODO`, `[NEEDS CLARIFICATION: …]`, vague adjectives like "robust"/"fast"/"intuitive" with no metric); **Azure / cloud**: target services + regions, identity model + RBAC, networking (private endpoints, VNet, egress), secret handling (Key Vault vs. inline), data residency / retention / backup, environments (`dev`/`staging`/`prod`), rollback expectations.

3. **Build a prioritized question queue** (internal — never reveal future questions). Max **5 questions per session**, ordered by `Impact × Uncertainty`. Each must be answerable as a **2–5 option multiple choice** (mutually exclusive options) **or** a **short answer** capped at `≤5 words`. Skip questions that are stylistic, already answered, or better deferred to `/speckit-plan` (note as "Deferred"). Constitution non-negotiables outrank everything; never ask the user to dilute them — clarify how the spec will satisfy them.

4. **Ask one question at a time**. For each: pick the most defensible option based on best practice, risk reduction, and constitution alignment.
   - **Multiple-choice format**:
     ```
     **Recommended:** Option <X> — <1–2 sentence reason>

     | Option | Description |
     |--------|-------------|
     | A | … |
     | B | … |
     | … | … |
     | Short | Provide a different short answer (≤5 words) |

     Reply with the option letter, "yes" / "recommended" to accept, or your own short answer.
     ```
   - **Short-answer format**:
     ```
     **Suggested:** <answer> — <brief reason>

     Format: ≤5 words. Reply "yes" / "suggested" to accept, or your own answer.
     ```
   - Treat `"yes"` / `"recommended"` / `"suggested"` as accepting the proposal. Validate each answer maps to an option or fits the ≤5-word constraint; one disambiguation pass allowed (doesn't consume a slot). Stop early on `"done"` / `"stop"` / `"proceed"`, when remaining queued questions become unnecessary, or after 5 accepted answers.

5. **Integrate each accepted answer into `spec.md` immediately** (atomic overwrite after each). Ensure a `## Clarifications` section exists (insert just after the overview if missing); ensure a `### Session YYYY-MM-DD` subheading for today; append `- Q: <question> → A: <final answer>` under that session. Apply the answer to the most appropriate section: functional ambiguity → Functional Requirements; role/actor → User Scenarios; data shape → Data Model (add fields/types/relationships, preserve order); non-functional → Success Criteria as a measurable target (replace vague adjectives with metrics); edge case → Edge Cases / Error Handling; terminology → normalize across the spec, adding `(formerly "X")` once if old term must remain referenced; Azure-specific → add a concrete value (service, SKU, region, identity, RBAC role, Key Vault reference, etc.) where the ambiguity lived. Replace invalid statements rather than duplicating; leave no contradictions. Resolve any matching `[NEEDS CLARIFICATION: …]` marker by removing it once integrated. Preserve unrelated sections, heading hierarchy, and formatting.

6. **Validate after each write and at the end**: one bullet per accepted answer in the session, no duplicates; ≤5 accepted questions total; no vague placeholder remains for an answered question; no contradictory earlier statement remains; only new headings introduced are `## Clarifications` and `### Session YYYY-MM-DD`; canonical terms used consistently across touched sections.

7. **Report**: path to updated `spec.md`; questions asked / accepted; sections touched; coverage summary per dimension — **Resolved**, **Deferred** (better in `/speckit-plan`), **Clear** (already sufficient), **Outstanding** (still ambiguous but low impact); recommended next command: `/speckit-plan`, or rerun `/speckit-clarify` if high-impact ambiguity remains.

## Guidelines

- Never ask more than 5 questions per session; retries on the same question don't count.
- If no meaningful ambiguity exists, say so and recommend proceeding to `/speckit-plan`.
- Don't ask speculative tech-stack questions unless the gap blocks functional clarity.
- Don't reveal upcoming questions in advance.
- Constitution non-negotiables can't be relaxed by clarification — only enforced.
