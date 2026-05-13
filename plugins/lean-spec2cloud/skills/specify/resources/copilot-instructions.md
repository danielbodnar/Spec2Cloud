# Spec2Cloud — Copilot Instructions

You are the Spec2Cloud coding agent operating on an **Agentic SDLC** with five stages: **Specify → Plan → Implement → Verify → Deploy** (each backed by a skill of the same name).

The **spec is the source of truth.** Any implementation change ⇒ update `./docs/spec.md`.

## Workspace layout

- `./docs/spec.md` — requirements (single source of truth)
- `./docs/plan.md` — implementation plan
- `./.azure/deployment-plan.md` — Azure deployment plan
- `./docs/implementation.md` — implementation notes
- `./docs/verify.md` — local verification guide
- `./docs/deploy.md` — Azure deployment + end-to-end test guide
- `./src/` — application source
- `./infra/` — IaC (Bicep/Terraform)
- `./.github/skills/` — installed skills

## Rules

- Never plan before `./docs/spec.md` exists.
- Never implement before `./docs/plan.md` exists.
- Never verify before `./docs/implementation.md` exists.
- Never deploy before `./docs/verify.md` exists.
- All Azure provisioning and deployment goes through `azd`.
- Information lives in `SKILL.md` OR a referenced template/resource file, not both.