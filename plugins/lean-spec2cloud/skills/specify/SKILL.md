---
name: specify
description: Use when starting or refining a project's requirements, before any planning or coding. Supports sub-commands `sync`, `reverse`, and `validate`.
---

# Specify Skill

## User Input

Natural-language description, optionally prefixed with a sub-command:

- `sync` — reconcile `spec.md` with the current chat history.
- `reverse` — generate/update `spec.md` from existing code in `src/`/`infra/`.
- `validate` — report gaps between current implementation and `spec.md`.
- (no sub-command) — treat input as create/update. If no input, ask the user; do not proceed without understanding intent.

## Execute

- Copy `.github/skills/specify/resources/copilot-instructions.md` to `.github/copilot-instructions.md` if missing.
- Create/update `./docs/spec.md` from `resources/spec-template.md`. The spec must be implementation-ready. Mark genuine unknowns as `[NEEDS CLARIFICATION: <question>]` rather than guessing — later stages must resolve them.
- Propose skills from `resources/skills-reference.md` matching the spec; for already-installed skills, compare versions.
- Ask the user to approve/modify/reject each suggested skill and choose **automatic** or **manual** install. For automatic:
  ```bash
  gh skills install <repository> <skill> --dir .github/skills --agent github-copilot
  ```

## Report

Report updated `docs/spec.md` content and a summary of installed skills.
