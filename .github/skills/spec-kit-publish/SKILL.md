---
name: spec-kit-publish
description: Publish Spec2Cloud spec-kit artifacts (extension, preset, workflow) together as a single GitHub Release. Use this skill whenever the user asks to publish, release, ship, or cut a release for the spec-kit — including phrases like "publish spec-kit", "publish the spec-kit", "release the spec-kit", or "cut a new spec-kit release". The skill bundles all three artifacts into one release whose version is the highest semver among the three manifests, and only publishes when that combined version is newer than the latest existing spec-kit release.
---

# Spec Kit Publish

Publishes the three spec-kit artifacts in this repository as **one combined GitHub Release** via the `gh` CLI. The extension and preset ship as zip assets; the workflow ships as the raw `workflow.yml` file. All three assets are attached to the same release.

## Artifacts

| Artifact type | Source folder                          | Manifest file    | Version field         | Asset name        |
| ------------- | -------------------------------------- | ---------------- | --------------------- | ----------------- |
| extension     | `spec-kit/extensions/spec2cloud`       | `extension.yml`  | `extension.version`   | `extension.zip`   |
| preset        | `spec-kit/presets/spec2cloud`          | `preset.yml`     | `preset.version`      | `preset.zip`      |
| workflow      | `spec-kit/workflows/spec2cloud`        | `workflow.yml`   | `workflow.version`    | `workflow.yml`    |

The combined release uses tag prefix `spec-kit-spec2cloud-v` (e.g. `spec-kit-spec2cloud-v0.2.0`). The version lives only on the release tag/title and inside each manifest — not in the asset filenames.

## When to run

Trigger on any prompt asking to publish/release/ship the spec-kit, e.g. "publish spec-kit", "release the spec-kit", "cut a new spec-kit release". Always process all three artifacts together — there is no per-artifact mode.

## Workflow

### Step 1 — Read all three manifest versions

Parse each YAML manifest and read the nested `<artifact>.version` field exactly:

- `spec-kit/extensions/spec2cloud/extension.yml` → `extension.version` → `EXT_VERSION`
- `spec-kit/presets/spec2cloud/preset.yml` → `preset.version` → `PRESET_VERSION`
- `spec-kit/workflows/spec2cloud/workflow.yml` → `workflow.version` → `WORKFLOW_VERSION`

### Step 2 — Compute the combined release version

`RELEASE_VERSION` is the **highest semver** among `EXT_VERSION`, `PRESET_VERSION`, `WORKFLOW_VERSION`. Use semver ordering, not lexical (e.g. `0.10.0 > 0.2.0`).

If unsure how to compare semver in the current environment, use Python:

```bash
python -c "from packaging.version import Version; import sys; print(max(sys.argv[1:], key=Version))" "$EXT_VERSION" "$PRESET_VERSION" "$WORKFLOW_VERSION"
```

### Step 3 — Fetch the latest published spec-kit release version

Use the `gh` CLI to find the most recent release whose tag starts with `spec-kit-spec2cloud-v`. Prefer parsing the JSON in the host shell rather than embedding `--jq` (escaping is fragile in PowerShell):

**PowerShell:**

```powershell
$rels = gh release list --limit 100 --json tagName,createdAt | ConvertFrom-Json
$latest = $rels | Where-Object { $_.tagName -like 'spec-kit-spec2cloud-v*' } |
    Sort-Object createdAt | Select-Object -Last 1 -ExpandProperty tagName
```

**Bash:**

```bash
gh release list --limit 100 --json tagName,createdAt \
  --jq '[.[] | select(.tagName | startswith("spec-kit-spec2cloud-v"))] | sort_by(.createdAt) | last | .tagName'
```

- If a tag is returned (e.g. `spec-kit-spec2cloud-v0.1.0`), strip the `spec-kit-spec2cloud-v` prefix to get `LATEST_VERSION`.
- If nothing is returned, treat `LATEST_VERSION` as "none".

### Step 4 — Compare and decide

- `LATEST_VERSION` is "none" → **publish**.
- `RELEASE_VERSION > LATEST_VERSION` → **publish**.
- `RELEASE_VERSION == LATEST_VERSION` → **skip** by default and tell the user the spec-kit is already published at this version. Only proceed if the user explicitly asks to overwrite/force-republish.
- `RELEASE_VERSION < LATEST_VERSION` → **skip** and warn that the manifests are behind the latest release. Do not downgrade.

### Step 5 — Update the CHANGELOG

Before building assets, promote the `## Unreleased` section in `spec-kit/CHANGELOG.md` into the new release entry. The skill is the **only** thing that should write into this file during a publish; the user maintains the `## Unreleased` section between releases.

1. Read `spec-kit/CHANGELOG.md`.
2. Locate the `## Unreleased` heading and capture every line until the next `## ` heading (its body — may include `### Added` / `### Changed` / `### Fixed` / `### Removed` subsections).
3. **If the captured body is empty** (only whitespace / no entries), insert a single placeholder line `- Maintenance release (no user-visible changes recorded).` so the new entry isn't blank.
4. Replace the `## Unreleased` block with:
   - A fresh empty `## Unreleased` section (heading only), followed by
   - `## [<RELEASE_VERSION>] — <YYYY-MM-DD>` (today's UTC date), followed by
   - `Components: extension `<EXT_VERSION>` · preset `<PRESET_VERSION>` · workflow `<WORKFLOW_VERSION>``, followed by
   - The captured body (preserving subsection headings and bullets verbatim).
5. At the bottom of the file, in the link-reference block, **insert a new line** `[<RELEASE_VERSION>]: https://github.com/<owner>/<repo>/releases/tag/spec-kit-spec2cloud-v<RELEASE_VERSION>` immediately under the `[Unreleased]: ...` line, and **update the `[Unreleased]` link** to compare against the new tag (`compare/spec-kit-spec2cloud-v<RELEASE_VERSION>...HEAD`).
6. Save the file. Do not touch any other section.

If overwriting an existing release (Step 7 below), do **not** rewrite the CHANGELOG — leave it as-is and tell the user the changelog entry was already promoted in the original publish.

### Step 6 — Build the release assets

The extension and preset are packaged as zips containing the **files inside** the artifact's source folder (not the folder itself), so consumers can extract directly into their own `extensions/` or `presets/` directories. The workflow is uploaded as the raw `workflow.yml` (no zip). Asset filenames do not include a version.

**PowerShell (Windows):**

```powershell
Compress-Archive -Path "spec-kit/extensions/spec2cloud/*" `
    -DestinationPath "extension.zip" -Force
Compress-Archive -Path "spec-kit/presets/spec2cloud/*" `
    -DestinationPath "preset.zip" -Force
Copy-Item "spec-kit/workflows/spec2cloud/workflow.yml" "workflow.yml" -Force
```

**Bash (macOS / Linux):**

```bash
(cd spec-kit/extensions/spec2cloud && zip -r "../../../extension.zip" .)
(cd spec-kit/presets/spec2cloud    && zip -r "../../../preset.zip" .)
cp spec-kit/workflows/spec2cloud/workflow.yml workflow.yml
```

Optionally verify zip layout with `unzip -l` (bash) or `Expand-Archive` (PowerShell) — files should sit at the root of each archive.

### Step 7 — Create (or overwrite) the combined GitHub Release

Attach the two zips and the workflow file to one release tagged `spec-kit-spec2cloud-v<RELEASE_VERSION>`. Use the new CHANGELOG entry body as the release notes when possible:

```bash
gh release create "spec-kit-spec2cloud-v<RELEASE_VERSION>" \
  "extension.zip" \
  "preset.zip" \
  "workflow.yml" \
  --title "Spec2Cloud Spec Kit v<RELEASE_VERSION>" \
  --notes-file <path-to-extracted-changelog-body>
```

If extracting the body to a temp file is awkward, fall back to:

```bash
  --notes "Spec2Cloud spec-kit release <RELEASE_VERSION>. extension: <EXT_VERSION>, preset: <PRESET_VERSION>, workflow: <WORKFLOW_VERSION>. See spec-kit/CHANGELOG.md for details."
```

If a release for that tag already exists and overwriting is approved, delete and recreate:

```bash
gh release delete "spec-kit-spec2cloud-v<RELEASE_VERSION>" --yes
gh release create "spec-kit-spec2cloud-v<RELEASE_VERSION>" ...   # same args as above
```

Surface overwrites clearly in the summary.

### Step 8 — Clean up

Remove the local assets from the repository root after a successful release so they aren't accidentally committed:

- PowerShell: `Remove-Item extension.zip, preset.zip, workflow.yml`
- Bash: `rm extension.zip preset.zip workflow.yml`

The modified `spec-kit/CHANGELOG.md` is left in the working tree for the user to commit.

## Reporting back to the user

Print a short summary, e.g.:

```
Release version (max of manifests): 0.2.0
Previous spec-kit release:          0.1.0
Action:                             Published

Assets:
  - extension.zip   (extension.version 0.2.0)
  - preset.zip      (preset.version 0.1.0)
  - workflow.yml    (workflow.version 0.1.0)

CHANGELOG: spec-kit/CHANGELOG.md updated (Unreleased → [0.2.0])
Release URL: https://github.com/<owner>/<repo>/releases/tag/spec-kit-spec2cloud-v0.2.0
```

## Preconditions and safety

- The `gh` CLI must be installed and authenticated. If `gh auth status` fails, stop and tell the user to run `gh auth login` first.
- Do **not** modify the manifest files — version bumps are the user's responsibility. This skill only reads versions.
- The skill **does** modify `spec-kit/CHANGELOG.md` (Step 5) to promote `## Unreleased` into the new release section. Leave the file in the working tree for the user to commit; never commit or push automatically.
- Do **not** create or push git tags manually; `gh release create` handles tag creation against the current commit on the default branch unless the user specifies otherwise.
- Overwriting an existing release for the same tag is allowed when the user asks for it (delete-then-recreate); always surface the overwrite in the summary. When overwriting, do not re-touch the CHANGELOG.
