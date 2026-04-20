# Lee's Squad

> You bring the vision. We bring the build.
> *"Stop coding. Start building."*

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work to the right specialist. Does not generate code itself. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Architect | Tech Lead | `.squad/agents/architect/charter.md` | ✅ Active |
| Designer | Design Lead | `.squad/agents/designer/charter.md` | ✅ Active |
| Backend | Backend Developer | `.squad/agents/backend/charter.md` | ✅ Active |
| Frontend | Frontend Developer | `.squad/agents/frontend/charter.md` | ✅ Active |
| Data | Data Engineer | `.squad/agents/data/charter.md` | ✅ Active |
| QA | QA Engineer | `.squad/agents/qa/charter.md` | ✅ Active |
| DevOps | Infrastructure & Delivery Engineer | `.squad/agents/devops/charter.md` | ✅ Active |
| Scribe | Session Logger | `.squad/agents/scribe/charter.md` | 📋 Silent |
| Ralph | Work Monitor | — | 🔄 Monitor |

## How the Team Works

**You are the Product Owner.** You bring PRDs, feature ideas, and direction.

1. **Start with Architect** — hand Architect your PRD or describe what you want to build
2. **Architect asks questions** — scope, constraints, tech preferences, definition of done
3. **Architect presents a build plan** — architecture + issue list before any code is written
4. **You approve the plan** — Architect creates GitHub issues and triggers the team
5. **Agents build in parallel** — Backend, Frontend, Data, QA
6. **Scribe logs decisions silently** — you get clean records of what was decided and why

## Coding Agent

<!-- copilot-auto-assign: false -->

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

### Capabilities

**🟢 Good fit — auto-route when enabled:**
- Bug fixes with a clear reproduction step
- Adding tests for existing functionality
- Implementing a spec that Architect has already written

**🟡 Needs review — proceed but flag for review:**
- Medium features once Architect has produced a spec
- Refactoring within a single module

**🔴 Not suitable — escalate to Architect:**
- Anything without clear acceptance criteria
- Architecture decisions
- Changes touching auth, security, or data migrations

### Git Workflow

- Branch from `dev`: `git checkout dev && git pull && git checkout -b squad/{issue-number}-{slug}`
- PRs target `dev`: `gh pr create --base dev`
- Naming: `squad/{issue-number}-{kebab-case-slug}`

## Project Context

- **Stack:** Determined per-project during Architect planning
- **Workflow:** PRD → Architect → specialists → merge to dev
