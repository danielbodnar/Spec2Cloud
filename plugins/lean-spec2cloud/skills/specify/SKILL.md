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
- `devcontainer` — copy `resources/devcontainer.json` to `.devcontainer/devcontainer.json` - don't overwrite if it already exists.

## Execute

- Copy `.github/skills/specify/resources/copilot-instructions.md` to `.github/copilot-instructions.md` if missing.
- Create `./docs` folder if doesn't exist.
- Create/update `./docs/spec.md` from `resources/spec-template.md`. The spec must be implementation-ready. For genuine unknowns: in interactive mode, ask the user directly; in non-interactive mode, make a best-judgment assumption. All `[NEEDS CLARIFICATION]` markers must be resolved before the spec is considered implementation-ready.

## Report

Summarize the changes applied to `./docs/spec.md`, list any open `[NEEDS CLARIFICATION]` markers, and prompt the user to continue with `plan` (produce a plan only) or `implement` (plan, then implement in one pass).
