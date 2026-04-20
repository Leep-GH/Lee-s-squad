---
name: "personal-squad"
description: "Ambient personal agent discovery, Ghost Protocol rules, and consult mode behaviour"
domain: "orchestration"
confidence: "high"
source: "extracted from squad.agent.md Team Mode → Personal Squad section"
---

## Context

Users may have a personal squad — a set of private agents in their user-level config directory that follow them across projects. These personal agents operate in **consult mode** under Ghost Protocol: they advise but never directly modify project state.

Check for personal agents on every session start (after resolving team root).

## Patterns

### Discovery Algorithm

1. **Kill switch check:** If `SQUAD_NO_PERSONAL` environment variable is set, skip discovery entirely.
2. **Resolve personal dir:** Call `resolvePersonalSquadDir()` — returns the user's personal squad path or `null`.
3. **Discover agents:** If personal dir exists, scan `{personalDir}/agents/` for `charter.md` files.
4. **Merge into cast:** Personal agents are additive — they do NOT replace project agents. On name conflict, project agent wins.
5. **Apply Ghost Protocol:** All personal agents operate under Ghost Protocol (see below).

### Ghost Protocol Rules

Every personal agent spawn MUST include these rules in the system prompt:

```
## Ghost Protocol (MANDATORY — you are a personal agent in a project context)
- Read-only project state: Do NOT write to .squad/ directories, agent history.md, decisions, or logs
- No project ownership: You ADVISE; project agents EXECUTE changes
- Transparent origin: Tag all log entries with [personal:{name}]
- Consult mode: Provide recommendations, analysis, and opinions — not direct file modifications
```

**Spawn personal agents with:**
- Charter from personal dir (not project `.squad/agents/`)
- Ghost Protocol block appended to system prompt
- `origin: 'personal'` tag in all log entries
- Consult mode: recommendations only, no execution

### Consult Mode Handoff

When a personal agent recommends changes:
1. Personal agent provides specific, actionable recommendation
2. Coordinator logs: `[consult] {personal-agent} → {project-agent}: {handoff summary}`
3. Coordinator spawns the appropriate project agent to execute the change
4. Personal agent is NOT re-spawned for the execution — it is read-only

### Session Acknowledgment

After personal agent discovery, if personal agents were found, include them in the session summary:
```
👤 Personal agents detected: {Name1} ({role}), {Name2} ({role}) — operating in consult mode
```

If `SQUAD_NO_PERSONAL` is set, no acknowledgment needed (silent skip).

### Name Conflict Resolution

If a personal agent has the same name as a project agent:
- Project agent wins — it takes the name in this session
- Personal agent is silently dropped (no error, no user notification)
- Log the conflict to `.squad/log/` for diagnostics

## Anti-Patterns

- ❌ Personal agents writing to project `.squad/` files (violates Ghost Protocol)
- ❌ Personal agents being assigned as the executor on a project task
- ❌ Letting personal agents self-identify as project agents (must tag with `[personal:{name}]`)
- ❌ Re-spawning the personal agent to "help" execute its own recommendation
- ❌ Discovering personal agents after session start (discovery is session-start only)
