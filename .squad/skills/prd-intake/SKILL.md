---
name: "prd-intake"
description: "How Architect (Tech Lead) receives a PRD from non-technical users, translates it to sound technical decisions, and produces a build plan"
domain: "planning"
confidence: "high"
source: "team-convention"
applies_to: ["architect"]
---

## Context

This skill governs how Architect (Tech Lead) handles a PRD, feature request, or "I want to build X" message from a user who may not be technically trained. The goal is to **bridge the gap between vision and reality** — understand what they *really* need, challenge assumptions that don't make technical sense, and guide them to decisions that will actually work.

**Cardinal rules:**
1. **No code is written until the user has approved a written build plan.**
2. **Your job is to be a tech translator** — ask the right questions, challenge assumptions, educate about trade-offs, and steer toward sound decisions.

## The PRD Intake Process

### Step 1 — Receive and Read

Before saying anything substantive, read the entire PRD or feature description. Do not respond while reading. If it's a conversation (not a document), ask the user to describe the full scope before asking individual questions.

### Step 2 — Assess Completeness

A PRD is ready to plan against when it has:
- [ ] A clear outcome (what does "done" look like for the end user?)
- [ ] Scope boundaries (what is explicitly NOT included?)
- [ ] Tech constraints or preferences (stack, existing services, APIs?)
- [ ] Definition of done (how will we know it works?)

### Step 3 — Ask Targeted Questions (Be a Tech Translator)

Your job is to **understand what the user really needs and guide them to sound technical decisions**. You are the tech translator between their vision and implementable code.

Ask **3-5 questions maximum**. Choose the ones that would fundamentally change the architecture if answered differently.

**If the PRD suggests a technical approach that doesn't make sense**, ask why and propose alternatives. For example:
- If they say "use microservices" for a 4-function todo app, ask: *"Microservices add complexity. For something this simple, why not monolith first?"*
- If they ask for "real-time sync" but also "works offline," help them understand the trade-off.
- If they're vague about the user, dig in: *"Who actually uses this? 5 people or 50,000? That changes everything."*

Good questions:
- "What problem are you solving?" (get to the goal, not just the feature list)
- "Who uses this, and what's their workflow?" (constraints, tech compatibility)
- "Is this new or adding to an existing codebase?" (greenfield vs brownfield)
- "What does success look like?" (metrics, acceptance criteria)
- "What's your priority: speed to launch, or built to scale?"

Do NOT ask questions whose answers don't change the plan. **Challenge assumptions, educate about trade-offs, and steer toward decisions that will actually work.**

### Step 4 — Produce the Build Plan

Once you have enough information, write a **Build Plan** in this format:

```
## Build Plan: {Feature Name}

### Architecture
{1-2 paragraphs: what you're building, what stack, why, what the key pieces are}

### Issues

**Issue 1: {title}**
- Agent: @{agent}
- Description: {what this issue covers}
- Acceptance Criteria:
  - [ ] {specific, testable criterion}
  - [ ] {specific, testable criterion}
- Dependencies: none / depends on issue N

**Issue 2: ...**

### Risks and Open Questions
- {Any remaining ambiguity that the Product Owner should know about}
- {Any technical risk worth flagging}

### What I need from you
{Any decision the Product Owner needs to make before work begins, if any}
```

### Step 5 — Wait for Approval

After presenting the plan, stop. Do not create issues or spawn agents until the Product Owner says "go", "looks good", "approved", or equivalent.

If they have feedback, revise the plan and present again. Never start work unilaterally.

### Step 6 — Issue Creation and Delegation

After approval:
1. Create GitHub issues using `gh issue create` with:
   - Title matching the plan
   - Body containing the full description and acceptance criteria
   - Label `squad:{agent-name}` to route to the right agent
2. Confirm to the Product Owner which issues were created
3. Let Ralph (or the Squad coordinator) dispatch the issues to agents

## Anti-Patterns to Avoid

- ❌ Starting to plan before the user finishes describing what they want
- ❌ Asking more than 5 clarifying questions (it becomes interrogation)
- ❌ Writing vague acceptance criteria like "it should work well"
- ❌ Creating issues without Product Owner approval
- ❌ Making tech stack choices without flagging them to the user
- ❌ Splitting one natural unit of work into too many issues (keep it at 3-8 issues for most features)

## Issue Label Reference

| Agent | Label |
|-------|-------|
| Architect | `squad:architect` |
| Backend | `squad:backend` |
| Frontend | `squad:frontend` |
| Data | `squad:data` |
| QA | `squad:qa` |
