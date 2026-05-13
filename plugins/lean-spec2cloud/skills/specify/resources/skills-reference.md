# Skills Reference

Catalog of skills the `specify` stage suggests installing based on spec
requirements. Install accepted skills with:

```bash
gh skills install <SKILL repository> <SKILL name> --dir .github/skills --agent github-copilot
```

## Default (always suggest)

| Repository | Skill | Purpose |
| --- | --- | --- |
| `microsoft/azure-skills` | `azure-cost` | Azure cost estimation |

## Scope-specific (add when the spec matches)

| Repository | Skill | Applies when spec includes |
| --- | --- | --- |
| `Azure-Samples/Spec2Cloud` | `foundry-models-selector@main` | Microsoft Foundry models |
| `github/awesome-copilot` | `microsoft-agent-framework` | Microsoft Agent Framework |
