---
name: "prd-intake"
description: "How Maven receives and processes a PRD or feature request from the Product Owner"
domain: "planning"
confidence: "high"
source: "team-convention"
applies_to: ["maven"]
---

## Context

This skill governs how Architect (Tech Lead) handles a PRD, feature request, or "I want to build X" message from the Product Owner. The goal is to prevent vague requirements from becoming bad code.

**Cardinal rule: No code is written until the Product Owner has approved a written build plan.**

## The PRD Intake Process

### Step 1 — Receive and Read

Before saying anything substantive, read the entire PRD or feature description. Do not respond while reading. If it's a conversation (not a document), ask the user to describe the full scope before asking individual questions.

### Step 2 — Assess Completeness

A PRD is ready to plan against when it has:
- [ ] A clear outcome (what does "done" look like for the end user?)
- [ ] Scope boundaries (what is explicitly NOT included?)
- [ ] Tech constraints or preferences (stack, existing services, APIs?)
- [ ] Definition of done (how will we know it works?)

### Step 3 — Ask Targeted Questions

Ask **3-5 questions maximum**. Not more. Choose the ones that would fundamentally change the architecture if answered differently.

Good questions:
- "Is this a new project or adding to an existing codebase?"
- "Do you have a database technology preference, or should I recommend one based on the requirements?"
- "Who are the users — public, authenticated, or internal only?"
- "Are there any third-party integrations required?"
- "What's your priority: get something working fast, or build it to scale from day one?"

Do NOT ask questions whose answers don't change the plan.

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
