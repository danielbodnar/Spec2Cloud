# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]` · **Created**: [YYYY-MM-DD] · **Status**: Draft · **Input**: User description: "$ARGUMENTS"

> Generated/updated by `/speckit-specify`. Focus on **what** and **why**, not **how** — implementation details belong in `plan.md`. Mark genuine unknowns with `[NEEDS CLARIFICATION: <question>]` instead of guessing; resolve via `/speckit-clarify`.

## Overview

[2–4 sentences: what this feature is, who it's for, the problem it solves. No tech stack, no Azure services — those live in `plan.md`.]

## User scenarios *(mandatory)*

> Each user story is an **independently testable** slice of value — implementing only one of them must still yield a viable MVP. Order by priority (`P1` is most critical).

### User Story 1 — [Brief title] (Priority: P1)

[Describe the user journey in plain language.]

**Why this priority**: [Value delivered + why it ranks here.]
**Independent test**: [How this slice is exercised on its own — e.g. "Demo by performing X and observing Y."]

**Acceptance scenarios**:
1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 — [Brief title] (Priority: P2)

[Describe the user journey.]

**Why this priority**: … · **Independent test**: …

**Acceptance scenarios**:
1. **Given** …, **When** …, **Then** …

---

### User Story 3 — [Brief title] (Priority: P3)

[Add or remove stories as needed; keep each one independently testable.]

### Edge cases

- What happens when [boundary condition]?
- How does the system handle [error / failure scenario]?
- What happens on partial / transient failure of an external dependency?

## Functional requirements *(mandatory)*

Each requirement is **independently testable** and references measurable outcomes from Success criteria where applicable.

- **FR-001**: System MUST [specific capability].
- **FR-002**: System MUST [specific capability].
- **FR-003**: Users MUST be able to [key interaction].
- **FR-004**: System MUST [data requirement].
- **FR-005**: System MUST [security / observability behavior].

*Marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method — Entra ID interactive, app-only, B2C invite?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period and deletion policy].

## Key entities *(include if the feature involves data)*

- **[Entity 1]**: [what it represents, key attributes — no schema or storage choice]
- **[Entity 2]**: [what it represents, relationships to other entities]

## Non-functional requirements

State measurable expectations. Use `[NEEDS CLARIFICATION: …]` for any number you cannot defend.

- **Performance**: [e.g. p95 latency < 300 ms for the primary user action; throughput target]
- **Scale**: [users, requests/day, data volume, regions in scope]
- **Availability / reliability**: [SLA, RTO, RPO]
- **Security & privacy**: [authN/Z model, data classification, threats explicitly in scope]
- **Compliance & data residency**: [regulatory regimes; allowed regions if relevant]
- **Accessibility & localization**: [if user-facing]
- **Observability**: [user-visible signals; required dashboards / alerts at the *what* level]

> Implementation choices (which Azure service, which SKU, which region SKU) belong in `plan.md`.

## Success criteria *(mandatory)*

Technology-agnostic, measurable outcomes. Avoid restating functional requirements.

- **SC-001**: [Outcome metric, e.g. "Users complete account creation in under 2 minutes."]
- **SC-002**: [System metric, e.g. "Handles 1 000 concurrent users with p95 < 300 ms."]
- **SC-003**: [User-success metric, e.g. "≥90% of users complete the primary task on first attempt."]
- **SC-004**: [Business metric, e.g. "Reduce support tickets for X by 50% within 90 days."]

## Out of scope

Things this feature explicitly will **not** do, to prevent scope drift in `/speckit-plan` and `/speckit-tasks`.

- [Out-of-scope item 1]
- [Out-of-scope item 2]

## Assumptions & dependencies

- [Assumption about users / environment, e.g. "Users authenticate with their corporate Entra ID tenant."]
- [Assumption about scope, e.g. "Mobile support is deferred to v2."]
- [Dependency on existing system / API / dataset]
- [Assumption about cost ceiling, if it materially shapes the feature]

## Clarifications

<!-- Populated by /speckit-clarify. Each session appends Q/A pairs without rewriting earlier sections. Do not edit by hand unless removing an obsolete entry. -->

### Session [YYYY-MM-DD]

- Q: [question] → A: [answer]
