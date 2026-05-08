# speckit-spec2cloud

VS Code agent plugin packaging the [Spec2Cloud spec-kit](../../spec-kit/) — preset (`spec-kit/presets/spec2cloud/`) and extension (`spec-kit/extensions/spec2cloud/`) — as a single set of agent skills.

> **Generated.** This folder is produced by the `package-speckit-spec2cloud-plugin` skill at `.github/skills/package-speckit-spec2cloud-plugin/`. Manual edits will be overwritten on the next regeneration. Update the source command files under `spec-kit/` and re-run the skill.

See the VS Code agent plugins documentation: <https://code.visualstudio.com/docs/copilot/customization/agent-plugins>.

## Workflow

`/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` → `/speckit-verify` → `/speckit-deploy`

Use `/speckit-analyze` and `/speckit-checklist` at any point for read-only quality reviews.

## Skills

| Skill | Source command | Description |
|-------|----------------|-------------|
| [speckit-constitution](./skills/speckit-constitution/SKILL.md) | `speckit.constitution` | Create or update the project constitution (principles, non-negotiables, out-of-scope). |
| [speckit-specify](./skills/speckit-specify/SKILL.md) | `speckit.specify` | Create spec.md from a feature description. |
| [speckit-clarify](./skills/speckit-clarify/SKILL.md) | `speckit.clarify` | Ask up to 5 targeted clarification questions to resolve ambiguity in the spec, then write the answers back into spec.md. |
| [speckit-plan](./skills/speckit-plan/SKILL.md) | `speckit.plan` | Create plan.md (technical context, architecture, design decisions) from the spec. |
| [speckit-tasks](./skills/speckit-tasks/SKILL.md) | `speckit.tasks` | Create tasks.md and tasks.json (dependency-ordered, phase-grouped) from plan and spec. |
| [speckit-implement](./skills/speckit-implement/SKILL.md) | `speckit.implement` | Execute pending tasks from tasks.md / tasks.json, updating both on completion. |
| [speckit-analyze](./skills/speckit-analyze/SKILL.md) | `speckit.analyze` | Read-only consistency, coverage, and Azure-readiness analysis across constitution, spec, plan, and tasks. |
| [speckit-checklist](./skills/speckit-checklist/SKILL.md) | `speckit.checklist` | Generate a domain-focused checklist that validates the quality of the requirements (completeness, clarity, consistency, measurability, coverage) — not the implementation. |
| [speckit-verify](./skills/speckit-verify/SKILL.md) | `speckit.spec2cloud.verify` | Run the implemented feature on local servers (provisioning Azure-only dependencies first) to verify it works before deploying to Azure. |
| [speckit-deploy](./skills/speckit-deploy/SKILL.md) | `speckit.spec2cloud.deploy` | Deploy the implemented feature to Azure once spec / plan / tasks / implement are complete. |

## Layout

```
plugins/speckit-spec2cloud/
├── .github/plugin/plugin.json
├── README.md
└── skills/<skill-name>/
    ├── SKILL.md
    └── assets/<template>.md   # only when the skill references templates
```

## Install

Register this plugin via the `chat.pluginLocations` setting in VS Code, or publish through your preferred plugin distribution channel. See the [plugin docs](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) for details.
