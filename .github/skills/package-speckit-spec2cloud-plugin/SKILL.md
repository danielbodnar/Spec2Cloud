---
name: package-speckit-plugin
description: Package the Spec2Cloud spec-kit (preset + extension) as a single VS Code agent plugin under `plugins/spec2cloud/`. Use whenever the user wants to package, build, generate, refresh, or rebuild the spec-kit as an agent plugin, mentions "agent plugin", "VS Code plugin", "package the spec-kit", "publish skills as a plugin", or asks to mirror the preset/extension commands into the plugin layout described at https://code.visualstudio.com/docs/copilot/customization/agent-plugins.
---

# Package spec-kit as a VS Code agent plugin

This skill mirrors the Spec2Cloud spec-kit (the **preset** at `spec-kit/presets/spec2cloud/` and the **extension** at `spec-kit/extensions/spec2cloud/`) into a VS Code agent plugin at `plugins/spec2cloud/`. Each spec-kit command becomes a skill folder; each referenced template is copied into that skill's `assets/` directory; cross-references are rewritten to use the plugin skill names.

The plugin format follows the VS Code agent-plugins documentation: <https://code.visualstudio.com/docs/copilot/customization/agent-plugins>.

## Inputs

- `spec-kit/presets/spec2cloud/preset.yml` — preset manifest. The `provides` array lists templates and commands.
- `spec-kit/extensions/spec2cloud/extension.yml` — extension manifest. The `provides.commands` array lists deploy / verify commands.
- All command source files referenced by those manifests under `spec-kit/presets/spec2cloud/commands/` and `spec-kit/extensions/spec2cloud/commands/`.
- All template source files under `spec-kit/presets/spec2cloud/templates/`.

## Output layout

```
plugins/spec2cloud/
├── .github/plugin/plugin.json     # Plugin manifest
├── README.md                # Plugin overview + skill index
└── skills/
    ├── speckit-constitution/
    │   └── SKILL.md
    ├── speckit-specify/
    │   └── SKILL.md
    ├── speckit-plan/
    │   ├── SKILL.md
    │   └── assets/
    │       ├── plan-template.md
    │       └── azure-template.md
    ├── speckit-tasks/
    │   ├── SKILL.md
    │   └── assets/
    │       └── tasks-template.md
    ├── speckit-implement/
    │   └── SKILL.md
    ├── speckit-analyze/
    │   └── SKILL.md
    ├── speckit-checklist/
    │   ├── SKILL.md
    │   └── assets/
    │       └── checklist-template.md
    ├── speckit-clarify/
    │   └── SKILL.md
    ├── speckit-deploy/        # extension command — `spec2cloud` segment dropped
    │   └── SKILL.md
    └── speckit-verify/        # extension command — `spec2cloud` segment dropped
        └── SKILL.md
```

## Naming rules

| Source | Skill folder + `name` |
|--------|-----------------------|
| Preset command `speckit.<x>` | `speckit-<x>` (replace dots with hyphens) |
| Extension command `speckit.spec2cloud.<x>` | `speckit-<x>` (drop `spec2cloud`, hyphenate) |

Skill names must be plain kebab-case — lowercase letters, numbers, hyphens — per the plugin docs. The skill folder name MUST equal the `name` value in its `SKILL.md` frontmatter.

## Steps

Run these in order. Each step is idempotent — re-running the skill produces the same output.

### 1. Read and parse the manifests

Parse `spec-kit/presets/spec2cloud/preset.yml` and `spec-kit/extensions/spec2cloud/extension.yml`. Build an in-memory list of commands; for each entry capture:

- Source command file path (`file` field).
- Source `name` (e.g. `speckit.constitution`, `speckit.spec2cloud.deploy`).
- `description` (verbatim from the YAML).
- Computed plugin skill `name` (apply the naming rules above).

### 2. Build a slash-command rewrite table

Compute it once from the command list. Used in step 4 to rewrite cross-references inside every `SKILL.md` body:

- `/speckit.spec2cloud.deploy` → `/speckit-deploy`
- `/speckit.spec2cloud.verify` → `/speckit-verify`
- `/speckit-spec2cloud-deploy` → `/speckit-deploy`
- `/speckit-spec2cloud-verify` → `/speckit-verify`
- `/speckit.<x>` → `/speckit-<x>` (for every preset command)

Apply the table in order of decreasing source-string length so longer matches replace before shorter ones.

### 3. Create the plugin skeleton

Create (or refresh) these directories:

- `plugins/spec2cloud/`
- `plugins/spec2cloud/skills/`
- `plugins/spec2cloud/skills/<skill-name>/` for every command
- `plugins/spec2cloud/skills/<skill-name>/assets/` only when the command references one or more templates (see step 5)

Do not delete unrelated files. If `plugins/spec2cloud/` already exists with extra content, **ASK** the user whether to clean it before regenerating.

### 4. Generate each `SKILL.md`

For every command, write `plugins/spec2cloud/skills/<skill-name>/SKILL.md`:

1. Read the source command file.
2. Strip the existing YAML frontmatter (everything between the first `---` line and the next `---` line, inclusive).
3. Prepend new frontmatter using exactly two fields, `name` and `description`, sourced from the YAML manifest entry:

   ```markdown
   ---
   name: <plugin skill name>
   description: <description from preset.yml or extension.yml>
   ---
   ```

4. In the body, apply the slash-command rewrite table from step 2.
5. In the body, rewrite every template path of the form `.specify/presets/spec2cloud/templates/<file>.md` (and any equivalent relative path like `templates/<file>.md`) to `assets/<file>.md`. Only rewrite paths to templates that this skill actually uses (see step 5 for the per-command list).

### 5. Copy referenced templates to `assets/`

For each command, copy its referenced template files into the skill's `assets/` folder. Use this mapping (verify by grepping the source command body for `templates/` references — re-derive if a future change adds or removes one):

| Skill | Templates copied into `assets/` |
|-------|--------------------------------|
| `speckit-constitution` | `constitution-template.md` |
| `speckit-specify` | `spec-template.md` |
| `speckit-plan` | `plan-template.md`, `azure-template.md` |
| `speckit-tasks` | `tasks-template.md` |
| `speckit-checklist` | `checklist-template.md` |
| `speckit-implement` | (none) |
| `speckit-analyze` | (none) |
| `speckit-clarify` | (none) |
| `speckit-deploy` | (none) |
| `speckit-verify` | (none) |

Source for every template: `spec-kit/presets/spec2cloud/templates/<filename>`. Copy verbatim — do not modify template contents.

### 6. Update the  skills

- Update command references:
  - `/speckit-spec2cloud-deploy` → `/speckit-deploy`
  - `/speckit-spec2cloud-verify` → `/speckit-verify`
- Update file references:
  - `.specify/memory/constitution.md` → `specs/constitution.md`
  - `.specify/feature.json` → `specs/feature.json`
  
### 7. Generate `plugins/spec2cloud/.github/plugin/plugin.json`

Write the manifest with the fields VS Code recognizes (per the docs):

```json
{
  "name": "spec2cloud",
  "description": "Spec-driven workflow for shipping to Azure: constitution → specify → clarify → plan → tasks → implement → verify → deploy.",
  "version": "<combined version>",
  "author": { "name": "Azure Samples" },
  "skills": [
    "./skills/speckit-constitution"
    ...
  ]
}
```

- `name` MUST be plain kebab-case (`spec2cloud` is valid). Do not use namespace prefixes.
- `version`: use the higher of `preset.preset.version` and `extension.extension.version` from the source manifests.
- `description`: derive from `preset.preset.description`; cap at 1024 chars.

### 7. Generate `plugins/spec2cloud/README.md`

Produce a short README that:

- Names the plugin and its source (the spec-kit at `spec-kit/`).
- States that this folder is generated by the `package-speckit-plugin` skill — manual edits will be overwritten on next run.
- Lists every skill in a table: `Skill | Source command | Description`. Pull descriptions from the manifests.
- Links to the VS Code agent-plugins docs.

### 8. Validate the output

After writing all files, verify:

1. Every `plugins/spec2cloud/skills/<dir>/SKILL.md` has frontmatter with `name` matching `<dir>` and a non-empty `description`.
2. Every template referenced inside any `SKILL.md` body resolves to a file under that skill's `assets/`.
3. No `SKILL.md` body contains an un-rewritten `/speckit.<x>` or `/speckit-spec2cloud-<x>` slash command.
4. `plugin.json` parses as JSON; `name` is kebab-case; `version` is semver.

If any check fails, report the offending file + line and stop — do not silently produce a broken plugin.

### 9. Report

Print a short summary:

- Plugin path, version, skill count.
- Per skill: source command, template count copied to `assets/`.
- Any warnings (e.g. extra files in `plugins/spec2cloud/` left intact).
- Suggested next step: register the plugin via `chat.pluginLocations` or publish through a marketplace.

## Notes & guardrails

- **Idempotent**: regenerating must produce the same byte-for-byte output for unchanged sources. Never inject timestamps or random IDs.
- **No silent overwrites of unrelated files**: only touch files inside `plugins/spec2cloud/`.
- **Follow source naming literally**: if a future spec-kit command introduces a new naming pattern, fall back to the rule "lowercase, replace dots with hyphens, drop a leading `spec2cloud` segment for extension commands".
- **Plugin format**: stick to the Copilot-format layout (`plugin.json` at the root). Do not generate Claude-format `.claude-plugin/` paths unless the user explicitly asks.
- **Cross-tool compatibility**: skill names must not contain slashes or namespace prefixes — VS Code silently drops invalid skills.
