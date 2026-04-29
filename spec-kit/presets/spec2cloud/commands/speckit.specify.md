---
description: Create a specification and store it in spec.md.
handoffs: 
  - label: Clarify Spec Requirements
    agent: speckit.clarify
    prompt: Clarify specification requirements
    send: true
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS` is the feature description from the triggering message — assume it's available even if the placeholder appears literally above. Don't ask the user to repeat it unless they provided an empty command.

1. **Create `<feature_directory>`** under `specs/`, named `<NNN>-<short-name>`:
   - `<NNN>` — 3-digit zero-padded sequence, one greater than the highest existing prefix in `specs/` (start at `001` if none).
   - `<short-name>` — 2–4 words, lowercase, hyphen-separated, derived from the feature description.

2. **Write `.specify/feature.json`** with the feature directory path:

   ```json
   { "feature_directory": "<feature_directory>" }
   ```

3. **Create the spec** based on `.specify/presets/spec2cloud/templates/spec-template.md`, stored in `<feature_directory>/spec.md` with these sections:
   - **Overview** — what the feature is and why it matters.
   - **User scenarios** — primary flows and edge cases.
   - **Functional requirements** — numbered, each independently testable.
   - **Success criteria** — observable, measurable outcomes.

   Guidelines: make informed defaults for unspecified details, marking genuine unknowns as `[NEEDS CLARIFICATION: <question>]`; focus on *what* and *why* — implementation details belong in `plan.md`; do not write code, choose a tech stack, or start implementation here.

4. **Report** the path to `<feature_directory>/spec.md` and a one-line summary.
