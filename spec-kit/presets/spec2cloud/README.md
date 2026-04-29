# Spec2Cloud Preset

A spec-driven preset tuned for shipping features to **Azure**. Overrides the core Spec Kit commands and templates with Azure-aware versions.

## Workflow

`constitution → specify → (clarify) → plan → (checklist · analyze) → tasks → implement → verify → deploy`

`verify` and `deploy` are provided by the companion **[spec2cloud extension](../../extensions/spec2cloud)**, not this preset.

## Commands

| Command | Output | Description |
|---------|--------|-------------|
| `speckit.constitution` | `.specify/memory/constitution.md` | Create or update the project constitution (principles, non-negotiables, out-of-scope). |
| `speckit.specify` | `spec.md` | Create a feature specification from a description. |
| `speckit.clarify` | updates `spec.md` | Up to 5 targeted questions; answers are written back into `spec.md`. |
| `speckit.plan` | `plan.md` | Technical context, Azure topology, architecture, design decisions. |
| `speckit.checklist` | `checklists/<theme>.md` | Quality checklist for the requirements (not the implementation). |
| `speckit.analyze` | *(report)* | Read-only consistency, coverage, and Azure-readiness analysis. |
| `speckit.tasks` | `tasks.md` + `tasks.json` | Phase-grouped, dependency-ordered tasks (kept in sync). |
| `speckit.implement` | *(code)* | Execute pending tasks; updates both `tasks.md` and `tasks.json`. |

Templates overridden: `constitution-template`, `spec-template`, `plan-template`, `tasks-template`, `checklist-template`.

## Releases

Published together with the extension and workflow as a single GitHub Release. See [`spec-kit/README.md`](../../README.md#publishing-releases).

## License

MIT
