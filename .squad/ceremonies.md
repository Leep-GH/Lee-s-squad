# Ceremonies

> Team rituals that happen before or after work.

## PRD Planning

| Field | Value |
|-------|-------|
| **Trigger** | manual |
| **When** | before any build work |
| **Condition** | User opens conversation with a PRD, feature idea, or "I want to build X" |
| **Facilitator** | architect |
| **Participants** | architect only (reports back to you before involving others) |
| **Enabled** | ✅ yes |

**Agenda:**
1. Architect reads the full PRD or feature description
2. Architect asks 3-5 targeted clarifying questions (scope, constraints, stack preferences, definition of done)
3. Architect produces a build plan: architecture summary + issue list with acceptance criteria + routing assignments
4. Architect presents the plan to the user for approval
5. **Only after approval:** Architect creates GitHub issues with `squad:{agent}` labels and agents begin work

**Output:** A written build plan in the conversation. No code until you say "go."

---

## Design Review

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | before |
| **Condition** | Multi-agent task involving Backend + Frontend or Data + Backend working on shared interfaces |
| **Facilitator** | architect |
| **Participants** | relevant agents |
| **Enabled** | ✅ yes |

**Agenda:**
1. Agree on API contract shapes (Forge ↔ Pixel) or data model (Vault ↔ Forge) before parallel work starts
2. Identify risks and unclear requirements
3. Assign action items

---

## Retrospective

| Field | Value |
|-------|-------|
| **Trigger** | auto |
| **When** | after |
| **Condition** | Build failure, test failure, or QA rejects a PR |
| **Facilitator** | architect |
| **Participants** | all involved |
| **Enabled** | ✅ yes |

**Agenda:**
1. What happened? (facts only)
2. Root cause — was this a spec problem, implementation problem, or missing tests?
3. What changes for next time?
4. Action items written to `.squad/decisions/inbox/`

