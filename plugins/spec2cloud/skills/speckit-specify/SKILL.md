---
name: speckit-specify
description: Create spec.md from a feature description.
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` is the feature description from the triggering message — assume it's available even if the placeholder appears literally above. Don't ask the user to repeat it unless they provided an empty command.

1. **Load context**. Read `specs/constitution.md` (principles, non-negotiables, out-of-scope) and run `/speckit-constitution without specific principles` automatically first, if the file is missing.

2. **Create `<feature_directory>`** under `specs/`, named `<NNN>-<short-name>`:
   - `<NNN>` — 3-digit zero-padded sequence, one greater than the highest existing prefix in `specs/` (start at `001` if none).
   - `<short-name>` — 2–4 words, lowercase, hyphen-separated, derived from the feature description.

3. **Write `specs/feature.json`** with the feature directory path:

   ```json
   { "feature_directory": "<feature_directory>" }
   ```

4. **Create the spec** based on `assets/spec-template.md`, stored in `<feature_directory>/spec.md` with these sections:
   - **Overview** — what the feature is and why it matters.
   - **User scenarios** — primary flows and edge cases.
   - **Functional requirements** — numbered, each independently testable.
   - **Success criteria** — observable, measurable outcomes.

   Guidelines: make informed defaults for unspecified details, marking genuine unknowns as `[NEEDS CLARIFICATION: <question>]`; focus on *what* and *why* — implementation details belong in `plan.md`; do not write code, choose a tech stack, or start implementation here.

5. **Report** the path to `<feature_directory>/spec.md` and a one-line summary.
