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

---

## Scribe Trigger Thresholds

> When is "substantial" work substantial enough to trigger Scribe?

Scribe is automatically spawned (background) when ANY of these thresholds are crossed:

| Threshold | Condition | Action |
|-----------|-----------|--------|
| **Agent count** | ≥ 2 agents ran in the same turn | Trigger Scribe after results collected |
| **Decision inbox** | ≥ 1 file in `.squad/decisions/inbox/` | Trigger Scribe — merge immediately |
| **Code written** | Agent produced or modified ≥ 1 source file | Trigger Scribe |
| **PR created/merged** | Any PR lifecycle event | Trigger Scribe |
| **Session length** | ≥ 10 coordinator turns since last Scribe run | Trigger Scribe — time-based cap |

Scribe is NOT triggered for:
- Direct Mode responses (status checks, factual questions)
- Read-only Lightweight Mode tasks (no files changed, no decisions made)
- When Scribe ran in the immediately preceding turn (cooldown: 1 turn)

**Concurrent write safety:** Multiple agents writing to `.squad/decisions/inbox/` simultaneously is safe — each agent writes to its own file (`{agent-name}-{slug}.md`). Scribe merges all of them in a single batch. No locking required.

---

## HITL Escalation — Emergency Stop

> What happens when humans need to step in mid-build?

### Emergency Stop

**Trigger:** User says any of: "stop", "pause", "hold", "abort", "STOP", or "wait — "

**Immediate response:**
1. Finish the current turn's tool calls (do not cancel in-flight agent work)
2. Do NOT spawn new agents in this turn
3. Report: `"⏸ Build paused. Here's where we are: {brief status of in-flight work}"`
4. Wait for the user to say "continue", "go", "resume", or give new direction

**What is preserved:** All completed work, decisions, and history remain unchanged. Scribe is spawned to commit `.squad/` state before the pause.

**What is not preserved:** Any in-flight agent output that hadn't been collected yet. These are noted as `⚠️ Incomplete — re-run needed.`

### Mid-Build HITL Blocker

An agent raises a blocker when:
- The spec has an ambiguity that would change the implementation (not a minor detail)
- A security concern requires a product decision (e.g., "should this endpoint be public or authenticated?")
- A dependency is unavailable and there are two valid alternatives with different trade-offs

**When a blocker is raised:**
1. Agent writes the blocker to `.squad/decisions/inbox/{agent}-blocker-{slug}.md` with format:
   ```
   ### BLOCKER: {title}
   **Agent:** {name}
   **Impact:** {what cannot proceed without this decision}
   **Options:**
     A. {option A and its trade-offs}
     B. {option B and its trade-offs}
   **Recommendation:** {agent's recommended option, if any}
   ```
2. Coordinator surfaces it to the user: `"⚠️ {AgentName} hit a blocker — [title]. Which way should we go? [Option A / Option B]"`
3. Other non-blocked agents continue in parallel
4. Once the user decides, coordinator spawns the unblocked agent with the decision

**Escalation timeout:** If the user has not responded to a blocker within the session and new work is requested, the coordinator MUST re-surface the blocker before doing new work: `"Before we continue — there's an open blocker from {AgentName}: {title}. Can we resolve that first?"`

### What Does NOT Require HITL

Agents proceed autonomously (no HITL required) for:
- Implementation decisions within the spec's constraints
- Choice of internal variable names, code style, test structure
- Minor implementation trade-offs where either choice produces equivalent outcomes
- Scribe operations (always autonomous)
- Ralph scanning and reporting (always autonomous)

---

## Scribe — What Gets Logged

Scribe logs every session to `.squad/log/{timestamp}-{topic}.md` with:
- Which agents ran, in what mode, with what task
- What files they produced or modified
- Decisions merged from inbox
- Any blockers raised
- Build outcome (completed / paused / blocked)

**Log format:**

```
## Session: {YYYY-MM-DD HH:MM} — {topic}
**Requested by:** {user name}
**Agents:** {Name} ({role}) · {Name} ({role})

### Work Done
- {AgentName}: {one-line summary of what they did}

### Decisions Merged
- {count} decisions from inbox ({agent} × {N})

### Blockers
- {none | description}

### Outcome
{completed | paused | blocked — {reason}}
```
