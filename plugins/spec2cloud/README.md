# spec2cloud plugin

VS Code agent plugin that mirrors the Spec2Cloud spec-kit (preset + extension) at [`spec-kit/`](../../spec-kit/) as a set of slash-command skills.

> **Generated.** This folder is produced by the `package-speckit-spec2cloud-plugin` skill. Manual edits will be overwritten on the next run — change the spec-kit sources under [`spec-kit/`](../../spec-kit/) instead.

## Skills

| Skill | Source command | Description |
|-------|----------------|-------------|
| `speckit-constitution` | `speckit.constitution` | Create or update the project constitution (principles, non-negotiables, out-of-scope). |
| `speckit-specify` | `speckit.specify` | Create spec.md from a feature description. |
| `speckit-clarify` | `speckit.clarify` | Ask up to 5 targeted clarification questions to resolve ambiguity in the spec, then write the answers back into spec.md. |
| `speckit-plan` | `speckit.plan` | Create plan.md (technical context, architecture, design decisions) from the spec. |
| `speckit-tasks` | `speckit.tasks` | Create tasks.md and tasks.json (dependency-ordered, phase-grouped) from plan and spec. |
| `speckit-implement` | `speckit.implement` | Execute pending tasks from tasks.md / tasks.json, updating both on completion. |
| `speckit-analyze` | `speckit.analyze` | Read-only consistency, coverage, and Azure-readiness analysis across constitution, spec, plan, and tasks. |
| `speckit-checklist` | `speckit.checklist` | Generate a domain-focused checklist that validates the quality of the requirements (completeness, clarity, consistency, measurability, coverage) — not the implementation. |
| `speckit-verify` | `speckit.spec2cloud.verify` | Run the implemented feature on local servers (provisioning Azure-only dependencies first) to verify it works before deploying to Azure. |
| `speckit-deploy` | `speckit.spec2cloud.deploy` | Deploy the implemented feature to Azure once spec / plan / tasks / implement are complete. |

## Layout

```
plugins/spec2cloud/
├── .github/plugin/plugin.json
├── README.md
└── skills/
    └── <skill-name>/
        ├── SKILL.md
        └── assets/        # template files referenced by the skill (when applicable)
```

## Install

Register the plugin via VS Code's `chat.pluginLocations` setting, pointing at this folder, or publish it through a marketplace.

## References

- [VS Code agent plugins documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins)
- Source preset: [`spec-kit/presets/spec2cloud/`](../../spec-kit/presets/spec2cloud/)
- Source extension: [`spec-kit/extensions/spec2cloud/`](../../spec-kit/extensions/spec2cloud/)
